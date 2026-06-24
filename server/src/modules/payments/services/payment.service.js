/**
 * payment.service.js
 *
 * WHO CALLS IT:
 *   payment.controller.js for all HTTP-driven operations, plus
 *   payment.controller.js's handleWebhook for the asynchronous Razorpay
 *   webhook path. No future module is expected to call into Payment —
 *   like Order, it sits at the top of the dependency chain, the final
 *   convergence point Order's own teaching phase explicitly deferred
 *   toward ("a future Payments module charges against the resulting
 *   Order, it does not create one").
 *
 * WHY IT EXISTS:
 *   Owns the business problem of turning a "pending" Order into a
 *   "confirmed" one with real money behind it. This file orchestrates TWO
 *   other modules' existing service functions
 *   (orderService.updateOrderStatus, couponService.redeemCoupon) and ONE
 *   provider-specific file (razorpay.service.js) — it never talks to
 *   Inventory directly, never talks to Cart directly, never talks to
 *   Razorpay's SDK directly, and never writes to Order/Cart/Coupon's own
 *   models directly. Inventory finalization happens INSIDE
 *   orderService.updateOrderStatus (which itself calls
 *   cartService.confirmCheckout) — this file simply triggers that
 *   existing transition, it does not duplicate it.
 *
 * THE THREE-STAGE FLOW THIS FILE IMPLEMENTS:
 *   1. createPayment  — customer requests to pay for a pending Order.
 *      Creates a Razorpay order + a local Payment document (status
 *      "pending"). No money has moved yet.
 *   2. verifyPayment   — customer's frontend returns Razorpay's response
 *      after checkout completes. THIS is the security-critical function:
 *      it cryptographically verifies the signature before trusting
 *      anything, then — and only on success — confirms the Order
 *      (finalizing Inventory) and redeems the Coupon.
 *   3. handleWebhook    — Razorpay's own server-to-server notification,
 *      processed independently of step 2 as a safety net (the customer's
 *      browser could close before step 2 completes, but the webhook still
 *      fires) — see handleWebhook's own doc comment for idempotency
 *      handling.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects (Payment documents) or thrown errors
 */

import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Order from "../../orders/models/order.model.js";
import * as orderService from "../../orders/services/order.service.js";
import * as couponService from "../../coupons/services/coupon.service.js";
import * as razorpayService from "./razorpay.service.js";

// ─── Create Payment ───────────────────────────────────────────────────────────
/**
 * Customer initiates payment for an existing "pending" Order.
 *
 * WHY amount IS READ FROM Order.totalAmount, NEVER FROM req.body:
 *   Accepting a client-supplied amount would let a customer pay an
 *   arbitrary lower figure for an order that costs more — the Razorpay
 *   order itself must be created with the EXACT amount our own backend
 *   has already computed and frozen on the Order document at creation
 *   time (see order.service.js's createOrderFromCart for why that number
 *   is itself immune to later Product price changes). This function reads
 *   that one already-authoritative number and nothing else.
 *
 * MULTIPLE-ATTEMPT SUPPORT (Business Rule 1):
 *   This function does NOT check for or block a prior failed Payment
 *   document on the same orderId — that is precisely the point. A new
 *   Payment document is created for every createPayment call, allowing
 *   "Attempt 1 → Failed, Attempt 2 → Failed, Attempt 3 → Success" to
 *   coexist as three separate audit records against the same Order. The
 *   one thing this function DOES guard against is creating a new payment
 *   attempt for an order that already has a "paid" Payment — there is
 *   nothing left to pay for at that point.
 *
 * @param {string} orderId - MongoDB ObjectId of the Order being paid for
 * @param {string} userId  - The authenticated customer's _id
 * @returns {Object}       - { payment, razorpayOrderId, amount, currency,
 *                             razorpayKeyId } — everything the frontend
 *                             Checkout SDK needs to render, and nothing more
 */
export const createPayment = async (orderId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const error = new Error("Invalid order ID format");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(orderId);

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (order.userId.toString() !== userId.toString()) {
    const error = new Error("You do not have permission to pay for this order");
    error.statusCode = 403;
    throw error;
  }

  if (order.status !== "pending") {
    const error = new Error(
      `Cannot create a payment for an order in "${order.status}" status`
    );
    error.statusCode = 400;
    throw error;
  }

  // Guard against paying twice for an already-paid order — checks for an
  // existing successful Payment, not merely "any payment exists," since
  // failed/cancelled attempts are expected and must not block a retry.
  const alreadyPaid = await Payment.findOne({ orderId, status: "paid" });
  if (alreadyPaid) {
    const error = new Error("This order has already been paid for");
    error.statusCode = 409;
    throw error;
  }

  // Amount comes exclusively from the already-frozen Order.totalAmount —
  // see doc comment above for why this is the one source of truth.
  const razorpayOrder = await razorpayService.createRazorpayOrder(
    order.totalAmount,
    "INR",
    order.orderNumber
  );

  const payment = await Payment.create({
    orderId: order._id,
    userId,
    provider: "razorpay",
    providerOrderId: razorpayOrder.id,
    amount: order.totalAmount,
    currency: "INR",
    status: "pending",
  });

  // razorpayKeyId is the PUBLIC key — safe to return to the frontend,
  // which needs it to initialise the Razorpay Checkout widget. The
  // SECRET key never leaves razorpay.service.js, let alone this response.
  return {
    payment: payment.toJSON(),
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  };
};

// ─── Verify Payment ───────────────────────────────────────────────────────────
/**
 * Verify Razorpay signature.
 *
 * Never trust frontend payment success. Backend must verify cryptographic
 * signature received from Razorpay before confirming payment.
 *
 * THIS IS THE SINGLE MOST IMPORTANT FUNCTION IN THE PAYMENT MODULE.
 * Every business rule in the brief converges here:
 *
 *   Rule 2 (never trust frontend success) — the very first thing this
 *   function does is cryptographically verify the signature via
 *   razorpay.service.js's verifySignature. If that check fails, this
 *   function stops immediately: the Payment is marked "failed" and
 *   NOTHING else happens — no Order confirmation, no Inventory
 *   finalization, no Coupon redemption.
 *
 *   Rule 3 (order confirmation only after verification) — orderService.
 *   updateOrderStatus(orderId, "confirmed", ...) is called ONLY after
 *   the signature check passes, never before.
 *
 *   Rule 4 (reserved stock -> sold stock) — this function does not call
 *   Inventory directly. orderService.updateOrderStatus already contains
 *   the logic that converts the reservation into a permanent deduction
 *   (via cartService.confirmCheckout) when transitioning an order from
 *   "pending" to "confirmed" — this function simply triggers that
 *   existing, already-tested transition rather than reimplementing it.
 *
 *   Rule 5 & 6 (coupon redemption only on success, never on failure) —
 *   couponService.redeemCoupon is called from inside the success branch
 *   ONLY, using order.appliedCoupon (frozen at order creation time, see
 *   order.model.js). If verification fails, this line never executes,
 *   meaning the coupon was never consumed and remains available to the
 *   customer for a retry or a future order.
 *
 * @param {string} orderId           - MongoDB ObjectId of our own Order
 * @param {string} razorpayOrderId   - From the client's verify request
 * @param {string} razorpayPaymentId - From the client's verify request
 * @param {string} razorpaySignature - From the client's verify request
 * @param {string} userId            - The authenticated customer's _id
 * @returns {Object}                 - { payment, order }
 */
export const verifyPayment = async (
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  userId
) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const error = new Error("Invalid order ID format");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findOne({
    orderId,
    providerOrderId: razorpayOrderId,
  });

  if (!payment) {
    const error = new Error("Payment record not found for this order");
    error.statusCode = 404;
    throw error;
  }

  if (payment.userId.toString() !== userId.toString()) {
    const error = new Error("You do not have permission to verify this payment");
    error.statusCode = 403;
    throw error;
  }

  if (payment.status === "paid") {
    // Idempotency: if this exact payment was already verified (e.g. the
    // client retried the verify call after a network blip on the first
    // success), return the existing successful result rather than
    // re-running confirmation logic a second time against Order/Inventory/
    // Coupon, which could otherwise throw on an already-confirmed order.
    const order = await Order.findById(orderId).lean();
    return { payment: payment.toJSON(), order };
  }

  // THE security-critical check. Everything past this point assumes the
  // signature has been cryptographically proven authentic.
  const isValid = razorpayService.verifySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    // Verification failed — record it and stop. Per Rules 6 & 7, nothing
    // downstream (Order, Inventory, Coupon) is touched from this branch.
    payment.status = "failed";
    payment.providerPaymentId = razorpayPaymentId;
    payment.failureReason = "Signature verification failed";
    await payment.save();

    const error = new Error("Payment verification failed");
    error.statusCode = 400;
    throw error;
  }

  // Signature verified — record the proof and mark this Payment paid.
  payment.status = "paid";
  payment.providerPaymentId = razorpayPaymentId;
  payment.providerSignature = razorpaySignature;
  payment.paidAt = new Date();
  await payment.save();

  // Confirms the Order, which internally finalizes the Inventory
  // reservation into a permanent sale (Rule 4) and sets
  // Order.paymentStatus to "paid" — reusing Order's own already-built
  // transition logic rather than duplicating it here.
  const updatedOrder = await orderService.updateOrderStatus(
    orderId,
    "confirmed",
    userId
  );

  // Coupon redemption becomes permanent ONLY here, after payment success
  // (Rules 5 & 6). order.appliedCoupon was frozen at order-creation time
  // in order.model.js and never touched since — this is the first and
  // only moment it is actually consumed.
  const order = await Order.findById(orderId);
  if (order.appliedCoupon) {
    await couponService.redeemCoupon(
      order.appliedCoupon.couponId,
      userId,
      order._id,
      order.appliedCoupon.discountAmount
    );
  }

  return { payment: payment.toJSON(), order: updatedOrder };
};

// ─── Handle Payment Failure (called by webhook or explicit failure report) ──
/**
 * Marks a payment attempt as failed without going through the signature
 * flow — used when Razorpay itself reports a failure (via webhook) rather
 * than the customer's browser returning a forged or absent success
 * response. Per Rules 6 & 7, this function never touches Order, Cart,
 * Inventory, or Coupon — a failed payment leaves the Order exactly as it
 * was (still "pending", reservation still held), free for the customer to
 * retry with a new createPayment call.
 *
 * @param {string} providerPaymentId - Razorpay's payment_id
 * @param {string} reason            - Failure reason from Razorpay's payload
 * @returns {Object|null}            - Updated Payment, or null if not found
 *                                      (webhook may arrive for a payment
 *                                      attempt this system never recorded)
 */
export const handlePaymentFailure = async (providerPaymentId, reason) => {
  const payment = await Payment.findOne({ providerPaymentId });

  if (!payment) return null;

  if (payment.status === "paid") {
    // A "failed" event arriving after we already recorded success is
    // treated as stale/out-of-order webhook delivery — never downgrade
    // an already-confirmed payment.
    return payment.toJSON();
  }

  payment.status = "failed";
  payment.failureReason = reason || "Payment failed";
  await payment.save();

  return payment.toJSON();
};

// ─── Process Refund (Admin) ──────────────────────────────────────────────────
/**
 * Admin-initiated refund against a previously successful Payment. Calls
 * Razorpay's refund API via razorpay.service.js, then records the
 * outcome locally. Supports partial refunds.
 *
 * THIS FUNCTION DOES NOT AUTOMATICALLY RE-OPEN INVENTORY OR UN-REDEEM THE
 * COUPON: a refund is a financial reversal, not necessarily a full order
 * cancellation — an admin processing a partial refund (e.g. for a
 * damaged-in-transit item) should not automatically restock inventory or
 * restore coupon eligibility. If a full reversal of the order itself is
 * intended, the admin separately calls orderService.updateOrderStatus to
 * transition the Order to "refunded"/"cancelled", which carries its own
 * explicit Inventory-release logic. Keeping these as two deliberate,
 * separate admin actions avoids silently coupling "money was refunded"
 * with "the order is void," which are not always the same business event.
 *
 * @param {string} paymentId - MongoDB ObjectId of the Payment document
 * @param {number} amount    - Optional partial refund amount; full refund
 *                              of the remaining un-refunded balance if omitted
 * @param {string} reason    - Admin-supplied reason, stored for audit
 * @param {string} adminId   - The requesting admin's _id
 * @returns {Object}         - Updated Payment document
 */
export const processRefund = async (paymentId, amount, reason, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    const error = new Error("Invalid payment ID format");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findById(paymentId);

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  if (payment.status !== "paid" && payment.status !== "refunded") {
    const error = new Error(
      `Cannot refund a payment in "${payment.status}" status`
    );
    error.statusCode = 400;
    throw error;
  }

  const remainingRefundable = payment.amount - payment.refundAmount;

  if (remainingRefundable <= 0) {
    const error = new Error("This payment has already been fully refunded");
    error.statusCode = 400;
    throw error;
  }

  const refundAmount = amount !== undefined ? amount : remainingRefundable;

  if (refundAmount > remainingRefundable) {
    const error = new Error(
      `Refund amount exceeds the remaining refundable balance of ${remainingRefundable}`
    );
    error.statusCode = 400;
    throw error;
  }

  await razorpayService.createRefund(payment.providerPaymentId, refundAmount);

  payment.refundAmount += refundAmount;
  payment.refundedAt = new Date();
  payment.status =
    payment.refundAmount >= payment.amount ? "refunded" : "paid";
  payment.metadata = {
    ...payment.metadata,
    lastRefundReason: reason,
    lastRefundBy: adminId,
  };
  await payment.save();

  return payment.toJSON();
};

/**
 * Refunds the most recent refundable payment attempt for a specific order.
 *
 * The admin module needs this because it reasons in terms of orders, not
 * individual payment attempt IDs. This helper keeps the payment-specific
 * lookup and refund rules centralized here, where they belong.
 *
 * @param {string} orderId - MongoDB ObjectId of the Order
 * @param {number|undefined} amount - Optional refund amount
 * @param {string} reason - Admin-supplied reason
 * @param {string} adminId - The requesting admin's _id
 * @returns {Object}       - Refunded payment document
 */
export const refundOrderPayment = async (orderId, amount, reason, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const error = new Error("Invalid order ID format");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findOne({
    orderId,
    status: { $in: ["paid", "refunded"] },
  }).sort({ createdAt: -1 });

  if (!payment) {
    const error = new Error("No refundable payment found for this order");
    error.statusCode = 404;
    throw error;
  }

  return processRefund(payment._id, amount, reason, adminId);
};

// ─── Get My Payments ──────────────────────────────────────────────────────────
/**
 * Customer-scoped payment history, paginated. Filter always anchored to
 * the authenticated caller's own userId — same ownership discipline as
 * every prior module's "my X" listing.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated customer
 * @param {Object} query  - Validated query params from paymentQuerySchema
 * @returns {Object}      - { payments, pagination }
 */
export const getMyPayments = async (userId, query) => {
  const { page, limit, status, sortBy, sortOrder } = query;

  const filter = { userId };
  if (status) filter.status = status;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [payments, totalCount] = await Promise.all([
    Payment.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Payment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    payments,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Get All Payments (Admin) ─────────────────────────────────────────────────
export const getAllPayments = async (query) => {
  const { page, limit, status, sortBy, sortOrder } = query;

  const filter = {};
  if (status) filter.status = status;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [payments, totalCount] = await Promise.all([
    Payment.find(filter)
      .populate("userId", "name email")
      .populate("orderId", "orderNumber totalAmount")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    payments,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Get Payment By ID ────────────────────────────────────────────────────────
/**
 * Ownership enforcement mirrors order.service.js's getOrderById exactly:
 * a non-admin caller must own the payment (matched on userId) or this
 * throws 403, never 404, to avoid leaking existence information.
 *
 * @param {string} paymentId        - MongoDB ObjectId of the Payment
 * @param {string} requestingUserId - The authenticated caller's _id
 * @param {boolean} isAdmin         - Whether the caller holds the admin role
 * @returns {Object}                - Payment document
 */
export const getPaymentById = async (paymentId, requestingUserId, isAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    const error = new Error("Invalid payment ID format");
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.findById(paymentId).lean();

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  if (!isAdmin && payment.userId.toString() !== requestingUserId.toString()) {
    const error = new Error("You do not have permission to view this payment");
    error.statusCode = 403;
    throw error;
  }

  return payment;
};
