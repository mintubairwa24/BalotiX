/**
 * order.validation.js
 *
 * WHO CALLS IT:
 *   order.routes.js — the validate()/validateQuery() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body / req.query before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as every prior module's
 *   validation file. Notably thin compared to Product/Coupon's validation
 *   files — Order creation itself takes NO body fields (everything it
 *   needs is read from the customer's existing Cart server-side), so
 *   there is very little for Zod to validate on the write path; most of
 *   this file's job is bounding query params for listing/filtering.
 *
 * INPUT:   Raw req.body / req.query from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

// ─── Create Order Schema ──────────────────────────────────────────────────────
// Used by POST /orders
// The client sends the selected shipping address ID so the backend can
// snapshot that address onto the order at creation time. The rest of the
// order contents still come from the authenticated user's Cart server-side,
// which preserves the original security model (backend remains the source
// of truth for pricing and line items).
export const createOrderSchema = z
  .object({
    shippingAddressId: z
      .string()
      .trim()
      .min(1, "Shipping address ID is required")
      .optional(),
  })
  .default({});

// ─── Cancel Order Schema ──────────────────────────────────────────────────────
// Used by PATCH /orders/:id/cancel
export const cancelOrderSchema = z.object({
  reason: z.string().max(500).trim().default(""),
});

// ─── Update Order Status Schema ───────────────────────────────────────────────
// Used by PATCH /orders/:id/status — admin only.
export const updateOrderStatusSchema = z.object({
  status: z.enum(
    [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
    {
      required_error: "Status is required",
      invalid_type_error: "Invalid status value",
    }
  ),
});

// ─── Order List Query Schema ──────────────────────────────────────────────────
// Validates query params for both GET /orders/my-orders (customer) and
// GET /orders (admin) — the same shape serves both, since the only
// difference between those two endpoints is the userId filter applied
// server-side in order.service.js, not anything the query string itself
// needs to express differently.
export const orderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  status: z
    .enum([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ])
    .optional(),

  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),

  sortBy: z.enum(["createdAt", "totalAmount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
