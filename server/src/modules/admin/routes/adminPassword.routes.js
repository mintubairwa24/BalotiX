import express from "express";

import * as adminPasswordController from "../controllers/adminPassword.controller.js";
import { updatePasswordSchema } from "../validations/adminPassword.validation.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate } from "../../../shared/middleware/validate.middleware.js";

/**
 * adminPassword.routes.js
 *
 * WHY THIS FILE EXISTS:
 *   The admin password update path is intentionally isolated from the rest
 *   of the admin router. That keeps the one self-service security-sensitive
 *   operation easy to audit and easy to protect.
 *
 * ROUTE GUARANTEES:
 *   - requireAuth first: the caller must be logged in.
 *   - requireRole("admin") next: only admins can reach the route.
 *   - validate() last: only a well-formed password payload reaches the controller.
 */

const router = express.Router();

router.patch(
  "/update-password",
  requireAuth,
  requireRole("admin"),
  validate(updatePasswordSchema),
  adminPasswordController.updatePassword
);

export default router;
