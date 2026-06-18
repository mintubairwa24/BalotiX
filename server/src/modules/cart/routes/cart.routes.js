/**
 * cart.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/cart".
 *   Example: app.use("/api/cart", cartRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Cart Module. Every single route requires
 *   requireAuth — there is zero public surface, since a cart is inherently
 *   personal data scoped to one user. Notably absent: requireRole("admin")
 *   anywhere in this file. Cart has no admin operations; the only access
 *   rule is "you can only touch your own cart," which is enforced inside
 *   cart.service.js by always scoping queries to req.user._id, not by any
 *   route-level role check.
 *
 * REUSE NOTE:
 *   Reuses requireAuth, validate, and productRateLimiter from shared/
 *   middleware/ — identical infrastructure to every prior module.
 */

import express from "express";
import * as cartController from "../controllers/cart.controller.js";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  addToCartSchema,
  updateQuantitySchema,
  startCheckoutSchema,
} from "../validations/cart.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// EVERY ROUTE BELOW REQUIRES AUTH — no public surface, no admin-only surface.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/cart
 * Returns the authenticated user's cart, creating an empty one if absent.
 */
router.get("/", requireAuth, cartController.getCart);

/**
 * POST /api/cart/items
 * Add a product to the cart, or merge quantity if already present.
 */
router.post(
  "/items",
  productRateLimiter,
  requireAuth,
  validate(addToCartSchema),
  cartController.addToCart
);

/**
 * PUT /api/cart/items/:productId
 * Set a line item's quantity to an exact new value.
 */
router.put(
  "/items/:productId",
  productRateLimiter,
  requireAuth,
  validate(updateQuantitySchema),
  cartController.updateItemQuantity
);

/**
 * DELETE /api/cart/items/:productId
 * Remove a single line item from the cart.
 */
router.delete(
  "/items/:productId",
  productRateLimiter,
  requireAuth,
  cartController.removeItem
);

/**
 * DELETE /api/cart
 * Empty the entire cart.
 */
router.delete(
  "/",
  productRateLimiter,
  requireAuth,
  cartController.clearCart
);

/**
 * POST /api/cart/checkout/start
 * Reserve stock for every cart item and transition to checkout_in_progress.
 */
router.post(
  "/checkout/start",
  productRateLimiter,
  requireAuth,
  validate(startCheckoutSchema),
  cartController.startCheckout
);

/**
 * POST /api/cart/checkout/confirm
 * Convert all reservations into permanent sales after payment succeeds.
 */
router.post(
  "/checkout/confirm",
  productRateLimiter,
  requireAuth,
  cartController.confirmCheckout
);

/**
 * POST /api/cart/checkout/abandon
 * Release all reservations after payment fails or checkout times out.
 */
router.post(
  "/checkout/abandon",
  productRateLimiter,
  requireAuth,
  cartController.abandonCheckout
);

export default router;