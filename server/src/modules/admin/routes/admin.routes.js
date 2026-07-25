/**
 * admin.routes.js
 *
 * Defines the API routes for admin-specific functionalities, starting with
 * user management. This router should be mounted at a path like `/api/admin`.
 */

import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import {
  requireAuth,
  requireRole,
} from "../../../shared/middleware/auth.middleware.js";
import {
  validate,
  validateQuery,
} from "../../../shared/middleware/validate.middleware.js";
import {
  listUsersQuerySchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  updateUserByAdminSchema,
  listProductsQuerySchema,
  createProductByAdminSchema,
  updateProductByAdminSchema,
  adminUpdateProductStatusSchema,
} from "../validations/admin.validation.js";
import { adminReviewsQuerySchema } from "../../reviews/validations/review.validation.js";

const router = express.Router();

// All routes in this file are for admins only.
router.use(requireAuth, requireRole("admin"));

/**
 * User Management Routes
 */

/**
 * GET /api/admin/activity
 * Recent dashboard activity for the admin home screen.
 */
router.get("/activity", adminController.getRecentActivity);

/**
 * GET /api/admin/users
 * List all users with filtering, sorting, and pagination.
 */
router.get("/users", validateQuery(listUsersQuerySchema), adminController.getUsers);

/**
 * GET /api/admin/users/:id
 * Get detailed information for a single user.
 */
router.get("/users/:id", adminController.getUserById);

/**
 * PATCH /api/admin/users/:id
 * Edit a user's profile details (e.g., name, phone).
 */
router.patch("/users/:id", validate(updateUserByAdminSchema), adminController.updateUserByAdmin);

/**
 * PATCH /api/admin/users/:id/status
 * Activate or suspend a user account.
 */
router.patch("/users/:id/status", validate(updateUserStatusSchema), adminController.updateUserStatus);

/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role.
 */
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.changeUserRole);

/**
 * Product Management Routes
 */

/**
 * GET /api/admin/products
 * List all products with filtering, sorting, and pagination.
 */
router.get("/products", validateQuery(listProductsQuerySchema), adminController.getProducts);

/**
 * POST /api/admin/products
 * Create a new product.
 */
router.post("/products", validate(createProductByAdminSchema), adminController.createProduct);

/**
 * GET /api/admin/products/:id
 * Get detailed information for a single product.
 */
router.get("/products/:id", adminController.getProductById);

/**
 * PATCH /api/admin/products/:id
 * Update a product's details.
 */
router.patch("/products/:id", validate(updateProductByAdminSchema), adminController.updateProduct);

/**
 * PATCH /api/admin/products/:id/status
 * Activate or archive a product.
 */
router.patch("/products/:id/status", validate(adminUpdateProductStatusSchema), adminController.updateProductStatus);

/**
 * DELETE /api/admin/products/:id
 * Permanently delete a product.
 */
router.delete("/products/:id", adminController.deleteProduct);

/**
 * Review Management Routes
 */

/**
 * GET /api/admin/reviews
 * List reviews with filtering, sorting, and pagination.
 */
router.get("/reviews", validateQuery(adminReviewsQuerySchema), adminController.getReviews);

/**
 * GET /api/admin/reviews/:id
 * Get detailed information for a single review.
 */
router.get("/reviews/:id", adminController.getReviewById);

/**
 * PATCH /api/admin/reviews/:id/hide
 * Hide a review from the storefront.
 */
router.patch("/reviews/:id/hide", adminController.hideReview);

/**
 * PATCH /api/admin/reviews/:id/restore
 * Restore a hidden review to the storefront.
 */
router.patch("/reviews/:id/restore", adminController.restoreReview);

/**
 * DELETE /api/admin/reviews/:id
 * Permanently delete a review.
 */
router.delete("/reviews/:id", adminController.deleteReview);

export default router;
