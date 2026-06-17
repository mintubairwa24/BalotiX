/**
 * category.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/categories".
 *   Example: app.use("/api/categories", categoryRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the public API surface of the Category Module. Reuses the exact
 *   same shared middleware as product.routes.js — requireAuth, requireRole,
 *   validate/validateQuery, and the rate limiters — proving the shared/
 *   layer is genuinely module-agnostic infrastructure.
 *
 * ROUTE ORDER (critical, same reasoning as product.routes.js):
 *   "/slug/:slug" and "/:id/breadcrumb" must be declared in a way that
 *   Express can disambiguate from "/:id" — since both start with a
 *   parameterised segment pattern, "/slug/:slug" (literal "slug" prefix)
 *   is unambiguous and order-independent relative to "/:id". However
 *   "/:id/breadcrumb" MUST come before any other "/:id/*" pattern that
 *   could collide — currently there is none, but this comment exists so
 *   future additions remember the rule.
 */

import express from "express";
import * as categoryController from "../controllers/category.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter, publicRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,
  categoryQuerySchema,
} from "../validations/category.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES — No authentication required
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/categories/slug/:slug
 * Fetch category by URL slug. Declared before "/:id" for the same reason
 * as product.routes.js — specific literal paths before parameterised ones.
 */
router.get(
  "/slug/:slug",
  publicRateLimiter,
  categoryController.getCategoryBySlug
);

/**
 * GET /api/categories
 * Returns flat array or nested tree. Query validated by categoryQuerySchema.
 */
router.get(
  "/",
  publicRateLimiter,
  validateQuery(categoryQuerySchema),
  categoryController.getAllCategories
);

/**
 * GET /api/categories/:id/breadcrumb
 * Root-to-leaf ancestor chain for breadcrumb UI.
 */
router.get(
  "/:id/breadcrumb",
  publicRateLimiter,
  categoryController.getBreadcrumbPath
);

/**
 * GET /api/categories/:id
 * Fetch a single category by its MongoDB ObjectId.
 */
router.get(
  "/:id",
  publicRateLimiter,
  categoryController.getCategoryById
);

// ═══════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES — Admin only
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/categories
 * Create a new category.
 */
router.post(
  "/",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(createCategorySchema),
  categoryController.createCategory
);

/**
 * PUT /api/categories/:id
 * Update a category. Supports re-parenting (cascades to descendants).
 */
router.put(
  "/:id",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * PATCH /api/categories/:id/status
 * Change category status. Archiving is blocked if products/children exist.
 */
router.patch(
  "/:id/status",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateCategoryStatusSchema),
  categoryController.updateCategoryStatus
);

/**
 * DELETE /api/categories/:id
 * Soft-deletes (archives) a category.
 */
router.delete(
  "/:id",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  categoryController.archiveCategory
);

export default router;