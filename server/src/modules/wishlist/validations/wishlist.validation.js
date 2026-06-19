/**
 * wishlist.validation.js
 *
 * WHO CALLS IT:
 *   wishlist.routes.js — the validate() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as every prior module. Notably
 *   lighter than cart.validation.js — there is no quantity field to bound,
 *   since wishlist items are binary (saved or not).
 *
 * INPUT:   Raw req.body from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// ─── Add To Wishlist Schema ──────────────────────────────────────────────────
// Used by POST /wishlist/items
export const addToWishlistSchema = z.object({
  productId: objectIdSchema,
});

// ─── Move To Cart Schema ──────────────────────────────────────────────────────
// Used by POST /wishlist/items/:productId/move-to-cart
// Quantity is optional here and defaults to 1 — unlike Cart's own
// addToCartSchema where quantity is a core, explicit decision, moving from
// a wishlist is most commonly a single-unit action ("I want one of these
// now"), so defaulting keeps the common case a zero-body-field request.
export const moveToCartSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0")
    .default(1),
});