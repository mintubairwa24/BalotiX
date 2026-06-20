/**
 * coupon.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/coupons".
 *   Example: app.use("/api/coupons", couponRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Coupon Module. The access pattern here
 *   is intentionally asymmetric, unlike Cart/Wishlist's uniform "everything
 *   requires auth, nothing requires admin" shape:
 *     - Listing/creating/updating/deactivating coupons: requireRole("admin")
 *       only. Customers can never browse the coupon catalog — that would
 *       let them discover unannounced codes.
 *     - Validating/applying/removing a coupon on YOUR OWN cart: requireAuth
 *       only, no admin role needed — this is the customer-facing "enter
 *       promo code" action.
 *
 * ROUTE ORDER:
 *   "/validate" and "/apply" are literal paths declared before "/:id" so
 *   Express never mistakes them for an ID parameter — same discipline as
 *   product.routes.js's "/featured" and "/search" routes.
 */

import express from "express";
import * as couponController from "../controllers/coupon.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter, publicRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
  couponQuerySchema,
} from "../validations/coupon.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER-FACING ROUTES — requireAuth only, no admin role required.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/coupons/validate
 * Read-only preview — checks a code and returns the discount without
 * applying it. Declared before "/:id" since "validate" is a literal path.
 */
router.post(
  "/validate",
  publicRateLimiter,
  requireAuth,
  validate(applyCouponSchema),
  couponController.validateCoupon
);

/**
 * POST /api/coupons/apply
 * Applies the coupon to the authenticated user's cart (provisional, not
 * yet redeemed).
 */
router.post(
  "/apply",
  productRateLimiter,
  requireAuth,
  validate(applyCouponSchema),
  couponController.applyCoupon
);

/**
 * DELETE /api/coupons/apply
 * Removes any currently applied coupon from the authenticated user's cart.
 */
router.delete(
  "/apply",
  productRateLimiter,
  requireAuth,
  couponController.removeCouponFromCart
);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN-ONLY ROUTES — full coupon catalog management.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/coupons
 * Admin dashboard listing — paginated, filterable by isActive.
 */
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  validateQuery(couponQuerySchema),
  couponController.getAllCoupons
);

/**
 * POST /api/coupons
 * Create a new coupon.
 */
router.post(
  "/",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(createCouponSchema),
  couponController.createCoupon
);

/**
 * GET /api/coupons/:id
 * Fetch a single coupon by its MongoDB ObjectId.
 */
router.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  couponController.getCouponById
);

/**
 * PUT /api/coupons/:id
 * Update a coupon's configuration.
 */
router.put(
  "/:id",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateCouponSchema),
  couponController.updateCoupon
);

/**
 * DELETE /api/coupons/:id
 * Deactivates (kill-switch) a coupon. Never a hard delete — see
 * coupon.service.js's deactivateCoupon doc comment.
 */
router.delete(
  "/:id",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  couponController.deactivateCoupon
);

export default router;