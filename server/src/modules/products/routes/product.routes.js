/**
 * product.routes.js
 *
 * WHO CALLS IT:
 *   The main app.js (or index.js) mounts this router at "/api/products".
 *   Example: app.use("/api/products", productRoutes)
 *
 * WHY IT EXISTS:
 *   Routes define the public API surface of the Product Module.
 *   Each route declaration answers three questions:
 *     1. What HTTP method and path triggers this action?
 *     2. What middleware chain must pass before the controller runs?
 *     3. Which controller function handles the request?
 *
 * MIDDLEWARE ORDER (critical — must not be reordered):
 *   [rateLimiter] → [requireAuth] → [requireRole] → [validate] → [controller]
 *   Each middleware either passes the request forward (next()) or rejects it.
 *   A rejected request never reaches the next step in the chain.
 *
 * ROUTE ORDER (critical for Express):
 *   Express matches routes in the order they are defined.
 *   Specific paths (/featured, /search, /slug/:slug) MUST be declared
 *   BEFORE parameterised paths (/:id), otherwise Express will try to
 *   treat "featured" as an ID and the route will never match.
 */

import express from "express";
import * as productController from "../controllers/product.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter, publicRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  updateStatusSchema,
  productQuerySchema,
} from "../validations/product.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES — No authentication required
// These are hit by search engine crawlers, anonymous users, and customers.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/products/featured
 * Returns active featured products for the homepage.
 * MUST be declared before /:id to prevent "featured" being treated as an ID.
 */
router.get(
  "/featured",
  publicRateLimiter,
  productController.getFeaturedProducts
);

/**
 * GET /api/products/search?q=iphone
 * Full-text search across name, description, and tags.
 */
router.get(
  "/search",
  publicRateLimiter,
  productController.searchProducts
);

/**
 * GET /api/products/slug/:slug
 * Fetch product by URL slug for SEO-friendly product pages.
 * Example: GET /api/products/slug/apple-iphone-15-pro
 */
router.get(
  "/slug/:slug",
  publicRateLimiter,
  productController.getProductBySlug
);

/**
 * GET /api/products
 * Paginated product listing with filters, sorting, and search.
 * Query params are validated by productQuerySchema.
 */
router.get(
  "/",
  publicRateLimiter,
  validateQuery(productQuerySchema),
  productController.getAllProducts
);

/**
 * GET /api/products/:id
 * Fetch a single product by its MongoDB ObjectId.
 */
router.get(
  "/:id",
  publicRateLimiter,
  productController.getProductById
);

// ═══════════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES — Admin only
// requireAuth verifies the JWT. requireRole("admin") checks the role claim.
// Both must pass or the request is rejected before reaching the controller.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/products
 * Create a new product. Body is validated against createProductSchema.
 */
router.post(
  "/",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * PUT /api/products/:id
 * Full or partial update of a product. Body validated against updateProductSchema.
 * Note: partial updates are supported — all fields are optional in updateProductSchema.
 */
router.put(
  "/:id",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * PATCH /api/products/:id/status
 * Update only the product's lifecycle status.
 * Body: { status: "active" | "inactive" | "draft" | "out_of_stock" | "archived" }
 */
router.patch(
  "/:id/status",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateStatusSchema),
  productController.updateProductStatus
);

/**
 * PATCH /api/products/:id/featured
 * Toggle the isFeatured flag. No body required.
 */
router.patch(
  "/:id/featured",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  productController.toggleFeatured
);

/**
 * DELETE /api/products/:id
 * Soft-deletes (archives) a product. Never removes the document from the DB.
 */
router.delete(
  "/:id",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  productController.archiveProduct
);

export default router;