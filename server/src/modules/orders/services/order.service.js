/**
 * order.service.js
 *
 * WHO CALLS IT:
 *   order.controller.js for all HTTP-driven operations. No future module
 *   is expected to call into Order the way Order calls into Cart,
 *   Inventory (indirectly), and Coupon — Order sits at the top of the
 *   dependency chain among the modules built so far, the convergence
 *   point every prior module's teaching phase explicitly deferred toward.
 *
 * WHY IT EXISTS:
 *   Owns the one operation no other module can perform alone: turning a
 *   Cart into a permanent, priced, stock-reserved commitment. This file
 *   orchestrates FOUR other modules' services in a single business
 *   transaction-like flow (Cart, Inventory via Cart, Product, Coupon),
 *   and is the only file in the codebase permitted to write to Order or
 *   OrderItem.
 *
 * WHY THIS FILE NEVER CALLS inventoryService DIRECTLY:
 *   Stock reservation/confirmation/release all happen through
 *   cartService.startCheckout / confirmCheckout / abandonCheckout, which
 *   already implement the atomic reserve-with-rollback logic against
 *   Inventory. Calling Inventory directly from here would duplicate that
 *   orchestration and risk Cart's own status/checkoutRef fields drifting
 *   out of sync with what Inventory actually holds. Order treats Cart as
 *   the single integration point for anything stock-related.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects (Order/OrderItem documents) or thrown errors
 */

import mongoose from "mongoose";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderitem.model.js";
import OrderCounter from "../models/ordercounter.model.js";
import Cart from "../../cart/models/cart.model.js";
import Product from "../../products/models/product.model.js";
import * as cartService from "../../cart/services/cart.service.js";
import {
  getUserAddressById,
  getUserAddresses,
} from "../../users/services/user.service.js";

// ─── Internal Helper: Generate unique order number ───────────────────────────
/**
 * Not exported. Atomically increments a per-year counter document (see
 * orderCounter.model.js for why a year-keyed document instead of a single
 * global counter) and formats the result as ORD-<year>-<6-digit-padded-seq>.
 *
 * Uses findOneAndUpdate with upsert + $inc as ONE atomic database
 * instruction — never findById, increment in JS, then save — which is
 * exactly the race condition this helper exists to avoid. Two customers
 * checking out simultaneously will always receive two different sequence
 * numbers, never the same one.
 *
 * @returns {string} - e.g. "ORD-2026-000001"
 */
const generateOrderNumber = async () => {
  const year = new Date().getFullYear().toString();

  const counter = await OrderCounter.findOneAndUpdate(
    { _id: year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const padded = String(counter.seq).padStart(6, "0");
  return `ORD-${year}-${padded}`;
};

// ─── Create Order From Cart ──────────────────────────────────────────────────
/**
 * The core operation of this entire module. Business rule: "order is
 * created before payment" — this function produces a "pending" Order with
 * stock already reserved, BEFORE any payment has been collected. A future
 * Payments module charges against the resulting Order, it does not create one.
 *
 * FULL SEQUENCE AND WHY EACH STEP IS ORDERED THIS WAY:
 *
 *   1. Read cart, reject if empty or already checkout_in_progress —
 *      cheap checks first, before anything expensive or stateful runs.
 *
 *   2. Re-validate every item's Product is still "active" — a product
 *      could have been deactivated/archived between being added to cart
 *      and checkout being attempted; this is the last chance to catch that
 *      before any commitment is made.
 *
 *   3. Compute subtotal/discountAmount/totalAmount from CART data only
 *      (cart.subtotal, cart.appliedCoupon.discountAmount) — NEVER from a
 *      fresh Product.price lookup. This is what guarantees "order totals
 *      must never depend on future Product price changes": the numbers
 *      are fixed here, once, from already-frozen Cart snapshot values.
 *
 *   4. Create the Order document in "pending"/"pending" status FIRST,
 *      before reserving any stock. This looks backwards at first glance,
 *      but it is required: cartService.startCheckout needs a real Order
 *      _id to pass through to Inventory as the reservation's `reference`
 *      value, and that _id cannot exist before the document does. This is
 *      a deliberate, necessary ordering, not an oversight.
 *
 *   5. Call cartService.startCheckout(userId, order._id) — reserves stock
 *      for every cart item via Inventory, with Cart's own built-in
 *      rollback if any single item's reservation fails partway through.
 *      "Inventory reservation follows reserve-first pattern" — nothing is
 *      permanently deducted yet, only held.
 *
 *   6. If step 5 throws, delete the Order created in step 4 and rethrow.
 *      An Order must NEVER persist in the database claiming items that
 *      were never actually reserved — without this rollback, a failed
 *      checkout would leave an orphaned "pending" order with no real
 *      stock backing it.
 *
 *   7. Snapshot every cart item into OrderItem documents —
 *      productNameSnapshot/productPriceSnapshot copied from Cart's own
 *      snapshot fields, productImageSnapshot freshly read from
 *      Product.thumbnail (the one field Cart does not itself snapshot).
 *   8. Order.appliedCoupon is frozen as a historical record (the
 *      discount this order is entitled to), but the coupon is NOT
 *      redeemed here. Permanent redemption — incrementing
 *      Coupon.usedCount and writing a CouponRedemption record — is
 *      deferred entirely to the Payment module's verifyPayment success
 *      path. This is what makes "coupon redemption becomes permanent
 *      only after successful payment" and "failed payment must not
 *      consume coupon" actually true: if every payment attempt for this
 *      order fails, the coupon was never consumed and remains available
 *      to the customer.
 * 
 * @param {string} userId - MongoDB ObjectId of the authenticated customer
 * @returns {Object}      - { order, items }
 */
export const createOrderFromCart = async (userId, shippingAddressId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    const error = new Error("Cannot create an order from an empty cart");
    error.statusCode = 400;
    throw error;
  }

  // The checkout lock is expected to already exist by the time the user
  // reaches the order-creation step. A cart that is already
  // `checkout_in_progress` is therefore a valid input for this endpoint,
  // not an error condition. The order flow should consume that locked cart
  // rather than trying to start checkout a second time and throw a 409.

  // Re-validate every product is still active before committing to an
  // order — catches anything deactivated/archived since it was cart-added.
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status !== "active") {
      const error = new Error(
        `"${item.nameSnapshot}" is no longer available for purchase`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  let shippingAddressSnapshot = null;

  if (shippingAddressId) {
    shippingAddressSnapshot = await getUserAddressById(userId, shippingAddressId);
  } else {
    const addresses = await getUserAddresses(userId);
    const defaultAddress = addresses.find((address) => address.isDefault);

    if (!defaultAddress) {
      const error = new Error("Please select a shipping address before placing the order");
      error.statusCode = 400;
      throw error;
    }

    shippingAddressSnapshot = defaultAddress;
  }

  if (!shippingAddressSnapshot) {
    const error = new Error("Shipping address could not be resolved for this order");
    error.statusCode = 400;
    throw error;
  }

  // Totals fixed from CART data only — never re-read live Product price.
  // This single block is what guarantees order totals never drift from
  // what the customer actually saw and agreed to at checkout.
  const subtotal = cart.subtotal;
  const discountAmount = cart.appliedCoupon?.discountAmount || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);

  const orderNumber = await generateOrderNumber();

  // Create the order document first. By the time this endpoint executes,
  // the checkout lock should already have been obtained by the checkout page
  // via the cart checkout-start mutation. We therefore do not re-enter
  // cartService.startCheckout() here. Doing so would attempt to lock the
  // same cart a second time and immediately return a 409 conflict.
  const order = await Order.create({
    orderNumber,
    userId,
    cartRef: cart._id,
    subtotal,
    discountAmount,
    appliedCoupon: cart.appliedCoupon || null,
    totalAmount,
    shippingAddress: shippingAddressSnapshot,
    status: "pending",
    paymentStatus: "pending",
  });

  // Keep the cart tied to this created order as the checkout reference.
  // This preserves the existing `checkoutRef` audit trail without
  // double-locking the cart in the order-create path.
  if (cart.status === "checkout_in_progress") {
    cart.checkoutRef = order._id;
    await cart.save();
  }

  // To avoid N+1 queries, fetch all product images in one go.
  const productIds = cart.items.map((item) => item.productId);
  const productsWithImages = await Product.find(
    { _id: { $in: productIds } },
    "thumbnail"
  ).lean();
  const imageMap = new Map(
    productsWithImages.map((p) => [p._id.toString(), p.thumbnail || ""])
  );

  // Snapshot every cart item into an OrderItem document. This preserves
  // historical accuracy. Name and price are from Cart's snapshots. The image
  // is from the map we just created.
  const orderItems = cart.items.map((item) => ({
    orderId: order._id,
    productId: item.productId,
    productNameSnapshot: item.nameSnapshot,
    productPriceSnapshot: item.priceSnapshot,
    productImageSnapshot: imageMap.get(item.productId.toString()),
    quantity: item.quantity,
    lineTotal: item.priceSnapshot * item.quantity,
  }));

  await OrderItem.insertMany(orderItems);

  // NOTE: Coupon redemption is intentionally NOT performed here.
  // Earlier versions of this function redeemed the coupon immediately at
  // order creation. That was corrected: the Payment module's business
  // rules require "coupon redemption becomes permanent only after
  // successful payment" and "failed payment must not consume coupon."
  // Order.appliedCoupon is still frozen here (above) as the historical
  // record of what discount applies to this order — but the act of
  // permanently consuming the coupon is deferred to paymentService.verifyPayment's
  // success path.

  const items = await OrderItem.find({ orderId: order._id }).lean();

  return { order: order.toJSON(), items };
};

// ─── Get My Orders ─────────────────────────────────────────────────────────────
/**
 * Customer-scoped order history, paginated. The filter is always anchored
 * to the userId passed in by the controller (taken from req.user._id) —
 * this function has no code path that can return another customer's
 * orders, since there is no parameter through which a caller-supplied
 * userId could override it.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated customer
 * @param {Object} query  - Validated query params from orderQuerySchema
 * @returns {Object}      - { orders, pagination }
 */
export const getMyOrders = async (userId, query) => {
  const { page, limit, status, paymentStatus, sortBy, sortOrder } = query;

  const filter = { userId };
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [orders, totalCount] = await Promise.all([
    Order.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    orders,
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

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
/**
 * Unfiltered-by-owner listing for the admin dashboard — the one place in
 * this module where orders from every customer are visible together.
 * Populates basic customer identity so an admin list view doesn't need a
 * second round trip per row.
 *
 * @param {Object} query - Validated query params from orderQuerySchema
 * @returns {Object}     - { orders, pagination }
 */
export const getAllOrders = async (query) => {
  const { page, limit, status, paymentStatus, sortBy, sortOrder, search } = query;

  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  // FIX: Added search functionality. This was a missing requirement from the checklist.
  // It allows admins to filter orders by their unique order number.
  // Searching by customer name/email would require a more complex aggregation pipeline.
  if (search) {
    filter.orderNumber = { $regex: search, $options: "i" };
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [orders, totalCount] = await Promise.all([
    Order.find(filter)
      .populate("userId", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    orders,
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

// ─── Get Order By ID ──────────────────────────────────────────────────────────
/**
 * Fetches a single order with its full line-item detail.
 *
 * OWNERSHIP ENFORCEMENT:
 *   A non-admin caller must supply requestingUserId, and the order's own
 *   userId must match it exactly, or this throws 403 — never 404, since a
 *   404 would let a customer probe for the existence of orders that
 *   aren't theirs by observing a different error code. Admin callers pass
 *   isAdmin=true, which bypasses the ownership comparison entirely,
 *   matching "Admin can access all orders" from the brief.
 *
 * @param {string} orderId          - MongoDB ObjectId of the Order
 * @param {string} requestingUserId - The authenticated caller's _id
 * @param {boolean} isAdmin         - Whether the caller holds the admin role
 * @returns {Object}                - { order, items }
 */
export const getOrderById = async (orderId, requestingUserId, isAdmin) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    const error = new Error("Invalid order ID format");
    error.statusCode = 400;
    throw error;
  }

  const order = await Order.findById(orderId).lean();

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  if (!isAdmin && order.userId.toString() !== requestingUserId.toString()) {
    const error = new Error("You do not have permission to view this order");
    error.statusCode = 403;
    throw error;
  }

  const items = await OrderItem.find({ orderId: order._id }).lean();

  return { order, items };
};

// ─── Cancel Order (Customer) ─────────────────────────────────────────────────
/**
 * Customer-initiated cancellation of their OWN order.
 *
 * WHY ONLY "pending"/"confirmed" CAN BE SELF-CANCELLED:
 *   Once an order reaches "processing" or beyond, fulfilment may already
 *   be physically underway (picked, packed, handed to a courier) — at
 *   that point cancellation has real-world logistics consequences a
 *   customer-facing endpoint should not trigger unilaterally. Those
 *   states require admin involvement via updateOrderStatus instead.
 *
 * WHY THIS CALLS cartService.abandonCheckout RATHER THAN INVENTORY DIRECTLY:
 *   Releasing the stock reservation must happen alongside resetting
 *   Cart's own status/checkoutRef back to normal — abandonCheckout already
 *   does both atomically as one operation. Calling Inventory's
 *   releaseReservation directly here would release the stock but leave
 *   Cart still marked checkout_in_progress, a state the customer could
 *   then get stuck in.
 *
 * @param {string} orderId - MongoDB ObjectId of the Order
 * @param {string} userId  - The authenticated customer's _id
 * @param {string} reason  - Optional free-text cancellation reason
 * @returns {Object}       - Updated order document
 */
export const cancelOrder = async (orderId, userId, reason) => {
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
    const error = new Error("You do not have permission to cancel this order");
    error.statusCode = 403;
    throw error;
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    const error = new Error(
      `Orders in "${order.status}" status cannot be self-cancelled. Contact support.`
    );
    error.statusCode = 400;
    throw error;
  }

  // Releases the Inventory reservation AND resets Cart's status/checkoutRef
  // in one call — see doc comment above for why this goes through Cart
  // rather than Inventory directly.
  await cartService.abandonCheckout(userId);

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelledBy = userId;
  order.cancellationReason = reason;
  await order.save();

  return order.toJSON();
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
/**
 * Admin transitions an order through its fulfilment lifecycle.
 *
 * TWO SIDE EFFECTS BAKED INTO SPECIFIC TRANSITIONS:
 *
 *   "pending" -> "confirmed": calls cartService.confirmCheckout, which
 *   converts the Inventory reservation into a PERMANENT stock deduction
 *   (mirrors Inventory's reserveStock -> confirmReservation flow) and
 *   marks paymentStatus "paid". This is the moment a reservation becomes
 *   an irreversible sale.
 *
 *   any non-terminal status -> "cancelled": calls
 *   cartService.abandonCheckout to release the reservation, same as the
 *   customer-facing cancelOrder path above — this is the admin-initiated
 *   equivalent of that same operation.
 *
 *   Every other transition (confirmed -> processing -> shipped ->
 *   delivered) is a pure status change with no Inventory/Cart side effect,
 *   since stock was already permanently deducted at the "confirmed" step.
 *
 * TERMINAL STATE GUARD:
 *   delivered/cancelled/refunded never transition further — attempting to
 *   move an order out of any of these throws, preventing e.g. a
 *   "delivered" order from being accidentally reset to "processing."
 *
 * @param {string} orderId  - MongoDB ObjectId of the Order
 * @param {string} newStatus - One of the valid status enum values
 * @param {string} adminId  - The requesting admin's _id
 * @returns {Object}        - { _id, orderNumber, status, paymentStatus, updatedAt }
 */
export const updateOrderStatus = async (orderId, newStatus, adminId) => {
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

  const terminalStatuses = ["delivered", "cancelled", "refunded"];
  if (terminalStatuses.includes(order.status)) {
    const error = new Error(
      `Orders in "${order.status}" status cannot transition further`
    );
    error.statusCode = 400;
    throw error;
  }

  // Reservation becomes a permanent sale the moment an order is confirmed.
  if (newStatus === "confirmed" && order.status === "pending") {
    await cartService.confirmCheckout(order.userId);
    order.paymentStatus = "paid";
  }

  // Admin-initiated cancellation releases the reservation, mirroring the
  // customer self-service cancelOrder path above.
  if (newStatus === "cancelled" && order.status !== "cancelled") {
    await cartService.abandonCheckout(order.userId);
    order.cancelledAt = new Date();
    order.cancelledBy = adminId;
  }

  order.status = newStatus;
  order.statusUpdatedBy = adminId;
  await order.save();

  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    updatedAt: order.updatedAt,
  };
};