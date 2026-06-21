/**
 * notification.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/notifications".
 *   Example: app.use("/api/notifications", notificationRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Notification Module. Per the brief,
 *   "All routes protected using requireAuth" — there is no public
 *   surface and no requireRole("admin") anywhere in this version;
 *   ownership alone gates access, matching "User can only access own
 *   notifications" / "Never expose another user's notifications" exactly.
 *   There is also no POST /notifications route — notification creation
 *   happens internally (other modules' services calling
 *   notificationService.createNotification or email.service.js's
 *   functions directly), not via a public HTTP endpoint, consistent with
 *   notification.validation.js's file-header explanation.
 *
 * ROUTE ORDER (critical, same discipline as every prior module):
 *   "/read-all" is a literal-prefixed path declared before the
 *   parameterised "/:id" routes — without this ordering, Express would
 *   attempt to match "read-all" against "/:id" first and treat it as a
 *   notification ID, never reaching the intended handler.
 */

import express from "express";
import * as notificationController from "../controllers/notification.controller.js";
import { requireAuth } from "../../../shared/middleware/auth.middleware.js";
import { validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { publicRateLimiter, productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import { listNotificationsQuerySchema } from "../validations/notification.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// EVERY ROUTE BELOW REQUIRES AUTH — no public surface, no admin-only surface.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/notifications
 * Paginated listing of the authenticated customer's own notifications,
 * plus an unreadCount for badge display.
 */
router.get(
  "/",
  publicRateLimiter,
  requireAuth,
  validateQuery(listNotificationsQuerySchema),
  notificationController.getUserNotifications
);

/**
 * PATCH /api/notifications/read-all
 * Declared BEFORE "/:id/read" and "/:id" — literal path must win over
 * any parameterised route, same discipline as every prior module's
 * "/featured", "/my-orders", "/my-payments" style routes.
 */
router.patch(
  "/read-all",
  productRateLimiter,
  requireAuth,
  notificationController.markAllAsRead
);

/**
 * GET /api/notifications/:id
 */
router.get("/:id", requireAuth, notificationController.getNotificationById);

/**
 * PATCH /api/notifications/:id/read
 */
router.patch(
  "/:id/read",
  productRateLimiter,
  requireAuth,
  notificationController.markAsRead
);

/**
 * DELETE /api/notifications/:id
 */
router.delete(
  "/:id",
  productRateLimiter,
  requireAuth,
  notificationController.deleteNotification
);

export default router;