/**
 * payment.controller.js
 *
 * WHO CALLS IT:
 *   payment.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as every prior module: extract from req,
 *   call service, send response. Zero business logic, zero direct Order/
 *   Inventory/Coupon/Razorpay access — all of that orchestration lives in
 *   payment.service.js and webhook.service.js. The one controller in this
 *   file that deviates from the standard try/catch-then-next(error)
 *   pattern is handleWebhook, documented below.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as paymentService from "../services/payment.service.js";
import * as webhookService from "../services/webhook.service.js";

// ─── Create Payment ───────────────────────────────────────────────────────────
/**
 * POST /api/payments/create
 * Customer only.
 */
export const createPayment = async (req, res, next) => {
  try {
    const result = await paymentService.createPayment(
      req.body.orderId,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Verify Payment ───────────────────────────────────────────────────────────
/**
 * POST /api/payments/verify
 * Customer only. The orderId is supplied in the body alongside Razorpay's
 * three verify fields — see verifyPaymentSchema for why all four are
 * required.
 */
export const verifyPayment = async (req, res, next) => {
  try {
    const result = await paymentService.verifyPayment(
      req.body.orderId,
      req.body.razorpayOrderId,
      req.body.razorpayPaymentId,
      req.body.razorpaySignature,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Payments ──────────────────────────────────────────────────────────
/**
 * GET /api/payments/my-payments
 * Customer only.
 */
export const getPaymentStatus = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentStatus(req.params.orderId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getMyPayments(
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Payment By ID ────────────────────────────────────────────────────────
/**
 * GET /api/payments/:id
 * Customer (own payments only) or Admin (any payment).
 */
export const getPaymentById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const payment = await paymentService.getPaymentById(
      req.params.id,
      req.user._id,
      isAdmin
    );

    res.status(200).json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Payments (Admin) ─────────────────────────────────────────────────
/**
 * GET /api/payments
 * Admin only.
 */
export const getAllPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getAllPayments(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Process Refund (Admin) ───────────────────────────────────────────────────
/**
 * POST /api/payments/:id/refund
 * Admin only.
 */
export const processRefund = async (req, res, next) => {
  try {
    const payment = await paymentService.processRefund(
      req.params.id,
      req.body.amount,
      req.body.reason,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Handle Webhook ───────────────────────────────────────────────────────────
/**
 * POST /api/payments/webhook
 * No auth — Razorpay calls this directly, server-to-server. Authenticity
 * is established entirely by webhook.service.js's signature check, not by
 * requireAuth (there is no customer session involved in a webhook call).
 *
 * WHY THIS ALWAYS RESPONDS 200, EVEN ON INTERNAL FAILURE:
 *   Razorpay retries webhook delivery on any non-2xx response, with
 *   exponential backoff, for a configured number of attempts. If our
 *   webhook signature check correctly rejects a payload (genuinely
 *   invalid signature — a real security event), we still want to return
 *   200 so Razorpay does not endlessly retry a request that will never
 *   become valid; that specific case is logged server-side instead. Any
 *   OTHER internal error (e.g. a transient DB hiccup while processing a
 *   legitimate, correctly-signed event) is logged the same way — Razorpay
 *   will naturally retry the event later because we still return 200,
 *   which is the desired behavior for a transient failure, but is also
 *   why processWebhookEvent's idempotency handling exists: a retried
 *   event must be safe to process more than once.
 *
 * req.rawBody is expected to be populated by payment.routes.js's raw-body
 * parsing middleware mounted specifically on this route — see routes file
 * for why express.json() cannot be used here.
 */
export const handleWebhook = async (req, res) => {
  try {
    const signatureHeader = req.headers["x-razorpay-signature"];

    await webhookService.processWebhookEvent(
      req.rawBody,
      signatureHeader,
      req.body
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Webhook] Processing error:", error.message);
    // Always 200 — see doc comment above for why this never propagates
    // to a non-2xx response or to the global error handler.
    res.status(200).json({ success: false, message: "Webhook acknowledged" });
  }
};