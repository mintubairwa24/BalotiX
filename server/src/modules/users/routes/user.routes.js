import express from "express";
import {
  requireAuth,
  requireRole,
} from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validate.middleware.js";
import {
  updateProfileSchema,
} from "../validations/user.validation.js";
import {
  listUsers,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get("/", requireAuth, requireRole("admin"), listUsers);

/**
 * @route   GET /api/users/profile
 * @desc    Get the logged-in user's profile
 * @access  Private
 */
router.get("/profile", requireAuth, getProfile);

/**
 * @route   PATCH /api/users/profile
 * @desc    Update the logged-in user's profile
 * @access  Private
 */
router.patch("/profile", requireAuth, validate(updateProfileSchema), updateProfile);

export default router;
