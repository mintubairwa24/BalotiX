import express from "express";
import {
  requireAuth,
  requireRole,
} from "../../../shared/middleware/auth.middleware.js";
import { listUsers } from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get("/", requireAuth, requireRole("admin"), listUsers);

export default router;