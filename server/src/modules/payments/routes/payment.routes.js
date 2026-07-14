/**
 * payment.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/payments".
 *   Example: app.use("/api/payments", paymentRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Payment Module. The access pattern
 *   mirrors Order/Coupon's asymmetric shape: customer routes need only
 *   requireAuth (ownership enforced in the service layer), admin routes
 *   additionally require requireRole("admin"), and the webhook route
 *   requires NEITHER — its authenticity comes entirely from the Razorpay
 *   signature check in webhook.service.js.
 *
 * CRITICAL: THE WEBHOOK ROUTE NEEDS RAW BODY, NOT PARSED JSON.
 *   app.js applies express.json() globally, which parses the body into a
 *   JS object and DISCARDS the original raw bytes. Razorpay's webhook
 *   signature is computed over the exact raw request body string — if we
 *   only have the re-serialized JS object, JSON.stringify(parsedBody)
 *   is NOT guaranteed to byte-for-byte match what Razorpay originally
 *   sent (key ordering, whitespace, number formatting can all differ),
 *   which would make every signature verification fail even for
 *   genuinely authentic webhooks. The middleware below captures the raw
 *   body onto req.rawBody BEFORE express.json() parses it, specifically
 *   and only for this one route.
 */

import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  createPaymentSchema,
  verifyPaymentSchema,
  refundPaymentSchema,
  paymentQuerySchema,
} from "../validations/payment.validation.js";

const router = express.Router();

// ─── Raw Body Capture Middleware (webhook route only) ────────────────────────
/**
 * Captures the exact raw request body as a string onto req.rawBody before
 * any JSON parsing occurs, so webhook.service.js's signature check can
 * verify against the precise bytes Razorpay actually sent. Applied ONLY
 * to the webhook route below — every other route in this file (and every
 * other module's routes) continues to rely on app.js's global
 * express.json() as normal.
 */
const captureRawBody = (req, res, next) => {
  let data = "";
  req.setEncoding("utf8");

  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    req.rawBody = data;
    try {
      req.body = JSON.parse(data);
    } catch {
      req.body = {};
    }
    next();
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// WEBHOOK ROUTE — no auth, no rate limiter (Razorpay's own retry behavior
// would otherwise be throttled by our own infrastructure), raw body only.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/webhook
 * Declared first/separately from the rest since it uses captureRawBody
 * instead of the standard validate() middleware — there is no Zod schema
 * here, since the payload shape is entirely defined by Razorpay, not by us.
 */
router.post("/webhook", captureRawBody, paymentController.handleWebhook);

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER ROUTES — requireAuth only; ownership enforced in the service layer.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/payments/create
 */
router.post(
  "/create",
  productRateLimiter,
  requireAuth,
  validate(createPaymentSchema),
  paymentController.createPayment
);

router.get(
  "/status/:orderId",
  requireAuth,
  paymentController.getPaymentStatus
);

/**
 * POST /api/payments/verify
 * The single most security-sensitive customer-facing route in this
 * module — see payment.service.js's verifyPayment doc comment.
 */
router.post(
  "/verify",
  productRateLimiter,
  requireAuth,
  validate(verifyPaymentSchema),
  paymentController.verifyPayment
);

/**
 * GET /api/payments/my-payments
 * Declared before "/:id" — literal path must win over the parameterised
 * route, same discipline as every prior module.
 */
router.get(
  "/my-payments",
  requireAuth,
  validateQuery(paymentQuerySchema),
  paymentController.getMyPayments
);

/**
 * GET /api/payments/:id
 * Customer can view only their own payment; admin can view any —
 * resolved inside payment.service.js's getPaymentById.
 */
router.get("/:id", requireAuth, paymentController.getPaymentById);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES — requireAuth + requireRole("admin").
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/payments
 * Lists every payment across every customer — admin dashboard view.
 */
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  validateQuery(paymentQuerySchema),
  paymentController.getAllPayments
);

/**
 * POST /api/payments/:id/refund
 */
router.post(
  "/:id/refund",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(refundPaymentSchema),
  paymentController.processRefund
);

export default router;