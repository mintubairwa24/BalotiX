/**
 * payment.validation.js
 *
 * WHO CALLS IT:
 *   payment.routes.js — the validate() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as every prior module. The
 *   verifyPaymentSchema is the single most security-critical schema in
 *   this entire codebase: it is the gate in front of the function that
 *   decides whether real money was actually received. Every field here is
 *   required and tightly typed precisely because "never trust frontend
 *   payment success" means the backend must demand exactly the
 *   cryptographic proof it needs, not optionally accept a vague payload.
 *
 * INPUT:   Raw req.body from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// ─── Create Payment Schema ─────────────────────────────────────────────────────
// Used by POST /payments/create
// Only the Order being paid for is supplied by the client. Amount,
// currency, and provider order creation are all resolved server-side from
// the Order document itself — never trusted from the request body, since
// a client-supplied amount would let a customer pay less than what they
// actually owe.
export const createPaymentSchema = z.object({
  orderId: objectIdSchema,
});

// ─── Verify Payment Schema ──────────────────────────────────────────────────────
// Used by POST /payments/verify
//
// These three fields are exactly what Razorpay's frontend checkout SDK
// returns to the client after a successful charge: razorpay_order_id,
// razorpay_payment_id, razorpay_signature. All three are REQUIRED — a
// signature cannot be verified without all three present, and accepting
// a request missing any of them would mean either skipping verification
// or verifying against incomplete data, both unacceptable given Rule 2
// ("never trust frontend payment success").
export const verifyPaymentSchema = z.object({
  orderId: objectIdSchema,
  razorpayOrderId: z
    .string({ required_error: "Razorpay order ID is required" })
    .min(1),
  razorpayPaymentId: z
    .string({ required_error: "Razorpay payment ID is required" })
    .min(1),
  razorpaySignature: z
    .string({ required_error: "Razorpay signature is required" })
    .min(1),
});

// ─── Refund Schema ────────────────────────────────────────────────────────────
// Used by POST /payments/:id/refund — admin only.
// amount is optional: omitting it means a full refund of the original
// paid amount; supplying it allows a partial refund, validated against
// the original amount in the service layer (never here, since that check
// requires reading the Payment document itself, not just the request shape).
export const refundPaymentSchema = z.object({
  amount: z.number().positive("Refund amount must be greater than 0").optional(),
  reason: z.string().max(500).trim().default(""),
});

// ─── Payment List Query Schema ────────────────────────────────────────────────
// Validates query params for GET /payments (admin) and GET /payments/my-payments.
export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["pending", "processing", "paid", "failed", "cancelled", "refunded"])
    .optional(),
  sortBy: z.enum(["createdAt", "amount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});