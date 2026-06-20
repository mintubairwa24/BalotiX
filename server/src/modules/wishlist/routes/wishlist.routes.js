/**
 * wishlist.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/wishlist".
 *   Example: app.use("/api/wishlist", wishlistRoutes
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Wishlist Module. Identical access
 *   pattern to cart.routes.js: every route requires requireAuth, zero
 *   public surface, zero requireRole("admin") anywhere — a wishlist is
 *   personal data with no admin operations, and ownership is enforced
 *   inside wishlist.service.js by always scoping to req.user._id.
 *
 * REUSE NOTE:
 *   Reuses requireAuth, validate, and productRateLimiter from shared/
 *   middleware/ — identical infrastructure to every prior module.
 */

import express from "express";
import * as wishlistController from "../controllers/wishlist.controller.js";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  addToWishlistSchema,
  moveToCartSchema,
} from "../validations/wishlist.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// EVERY ROUTE BELOW REQUIRES AUTH — no public surface, no admin-only surface.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/wishlist
 * Returns the authenticated user's wishlist, creating an empty one if absent.
 */
router.get("/", requireAuth, wishlistController.getWishlist);

/**
 * POST /api/wishlist/items
 * Save a product to the wishlist. Re-adding an already-saved product is a
 * no-op, not an error.
 */
router.post(
  "/items",
  productRateLimiter,
  requireAuth,
  validate(addToWishlistSchema),
  wishlistController.addToWishlist
);

/**
 * DELETE /api/wishlist/items/:productId
 * Remove a single saved product from the wishlist.
 */
router.delete(
  "/items/:productId",
  productRateLimiter,
  requireAuth,
  wishlistController.removeFromWishlist
);

/**
 * POST /api/wishlist/items/:productId/move-to-cart
 * Migrate a saved product into the cart. Runs Cart's full stock/status
 * validation; the wishlist item is only removed if that validation passes.
 */
router.post(
  "/items/:productId/move-to-cart",
  productRateLimiter,
  requireAuth,
  validate(moveToCartSchema),
  wishlistController.moveToCart
);

export default router;