/**
 * review.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/reviews".
 *   Example: app.use("/api/reviews", reviewRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Review Module. Per the brief, "all
 *   routes require authentication" — unlike Product/Category, this module
 *   has no public, unauthenticated surface at all, even for reads. There
 *   is also no requireRole("admin") anywhere in this version — ownership
 *   (not role) is what gates write access, matching "User cannot modify
 *   another user's review" exactly. A future admin-moderation feature
 *   would add separate admin-only routes alongside these, not replace them.
 *
 * ROUTE ORDER (critical, same discipline as every prior module):
 *   "/product/:productId" and "/my-reviews" are literal-prefixed paths
 *   that MUST be declared before the bare "/:id" route, or Express would
 *   attempt to treat "product" or "my-reviews" as a review ID and the
 *   intended route would never match.
 */

import express from "express";
import * as reviewController from "../controllers/review.controller.js";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter, publicRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  createReviewSchema,
  updateReviewSchema,
  productReviewsQuerySchema,
  userReviewsQuerySchema,
} from "../validations/review.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// EVERY ROUTE BELOW REQUIRES AUTH — no public surface in this module.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/reviews
 * Eligibility (purchased + delivered + not already reviewed) fully
 * enforced inside review.service.js's createReview.
 */
router.post(
  "/",
  productRateLimiter,
  requireAuth,
  validate(createReviewSchema),
  reviewController.createReview
);

/**
 * GET /api/reviews/product/:productId
 * Declared before "/:id" — literal "product" prefix must win over the
 * parameterised single-review route, same discipline as product.routes.js's
 * "/featured" and "/search".
 */
router.get(
  "/product/:productId",
  publicRateLimiter,
  requireAuth,
  validateQuery(productReviewsQuerySchema),
  reviewController.getProductReviews
);

/**
 * GET /api/reviews/my-reviews
 * Declared before "/:id" for the same reason as "/product/:productId" above.
 */
router.get(
  "/my-reviews",
  requireAuth,
  validateQuery(userReviewsQuerySchema),
  reviewController.getUserReviews
);

/**
 * GET /api/reviews/:id
 * Any authenticated user may view any single review — no ownership
 * restriction on reads, only on writes (see PATCH/DELETE below).
 */
router.get("/:id", requireAuth, reviewController.getReviewById);

/**
 * PATCH /api/reviews/:id
 * Ownership enforced inside review.service.js's updateReview.
 */
router.patch(
  "/:id",
  productRateLimiter,
  requireAuth,
  validate(updateReviewSchema),
  reviewController.updateReview
);

/**
 * DELETE /api/reviews/:id
 * Ownership enforced inside review.service.js's deleteReview.
 */
router.delete(
  "/:id",
  productRateLimiter,
  requireAuth,
  reviewController.deleteReview
);

export default router;