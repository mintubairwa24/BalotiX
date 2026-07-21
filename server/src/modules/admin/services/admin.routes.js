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
 } from "../validations/admin.validation.js";

const router = express.Router();

// All routes in this file are for admins only.
router.use(requireAuth, requireRole("admin"));

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
 * PATCH /api/admin/users/:id/status
 * Activate or suspend a user account.
 */
router.patch("/users/:id/status", validate(updateUserStatusSchema), adminController.updateUserStatus);

/**
 * PATCH /api/admin/users/:id/role
 * Change a user's role.
 */
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.changeUserRole);

export default router;