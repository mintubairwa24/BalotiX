/**
 * cart.validation.js
 *
 * WHO CALLS IT:
 *   cart.routes.js — the validate() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as every prior module's
 *   validation file. Catches malformed quantities and invalid ObjectIds
 *   before any Product/Inventory lookup is attempted.
 *
 * INPUT:   Raw req.body from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// ─── Add To Cart Schema ────────────────────────────────────────────────────────
// Used by POST /cart/items
export const addToCartSchema = z.object({
  productId: objectIdSchema,

  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .default(1),
});

// ─── Update Quantity Schema ────────────────────────────────────────────────────
// Used by PUT /cart/items/:productId
// Quantity of 0 is intentionally rejected here — removing an item is a
// distinct, explicit operation (DELETE /cart/items/:productId), so a
// "set quantity to 0" request is treated as a validation error rather than
// silently triggering a removal as a side effect of this endpoint.
export const updateQuantitySchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0, use the remove endpoint to delete an item"),
});

// ─── Start Checkout Schema ──────────────────────────────────────────────────────
// Used by POST /cart/checkout/start — no body fields needed today, but kept
// as an explicit empty schema so a future field (e.g. a coupon code applied
// at checkout-start) has an obvious place to land without restructuring
// the route or controller signature.
export const startCheckoutSchema = z.object({}).default({});
