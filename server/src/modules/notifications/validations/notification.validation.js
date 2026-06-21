/**
 * notification.validation.js
 *
 * WHO CALLS IT:
 *   notification.routes.js — the validate()/validateQuery() middleware
 *   from shared/middleware/validate.middleware.js runs these schemas
 *   against req.body / req.query before the request reaches the
 *   controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as every prior module's
 *   validation file. Notably, there is NO public "create notification"
 *   HTTP endpoint in this module's API surface — notifications are
 *   created internally, by other modules' services calling
 *   notification.service.js's createNotification() directly in process
 *   (e.g. order.service.js will eventually call this when an order ships).
 *   createNotificationSchema is still provided here because the brief
 *   asks for it explicitly ("Validate: notification creation"), and
 *   because validating the SHAPE of data passed into createNotification
 *   is good practice even for internal, same-process calls — a typo'd
 *   event string from a calling module should fail loudly and early,
 *   not silently produce a malformed document.
 *
 * INPUT:   Raw req.body / req.params / req.query from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// Mirrors notification.model.js's enums exactly — kept as standalone
// exported constants so notification.service.js can import and reuse
// the same enum values rather than retyping them, the same pattern
// product.validation.js used for its status enum.
export const NOTIFICATION_TYPES = ["EMAIL", "IN_APP", "SYSTEM"];

export const NOTIFICATION_EVENTS = [
  "WELCOME_EMAIL",
  "EMAIL_VERIFICATION",
  "PASSWORD_RESET",
  "ORDER_CONFIRMED",
  "ORDER_SHIPPED",
  "ORDER_DELIVERED",
  "PAYMENT_SUCCESS",
  "PAYMENT_FAILED",
  "REFUND_PROCESSED",
  "COUPON_CREATED",
  "REVIEW_REMINDER",
];

// ─── Create Notification Schema ──────────────────────────────────────────────
// Used internally by notification.service.js's createNotification, and
// available for any future internal HTTP/admin endpoint that might need
// it. userId is REQUIRED here (unlike most "my X" patterns elsewhere in
// this codebase) because notification creation is triggered BY other
// modules ON BEHALF OF a customer, not by the customer's own authenticated
// request — there is no req.user._id to default to at the point this is
// called from, e.g., order.service.js.
export const createNotificationSchema = z.object({
  userId: objectIdSchema,

  type: z.enum(NOTIFICATION_TYPES, {
    required_error: "Notification type is required",
  }),

  event: z.enum(NOTIFICATION_EVENTS, {
    required_error: "Notification event is required",
  }),

  title: z
    .string({ required_error: "Notification title is required" })
    .min(1, "Title cannot be empty")
    .max(150, "Title must not exceed 150 characters")
    .trim(),

  message: z
    .string({ required_error: "Notification message is required" })
    .min(1, "Message cannot be empty")
    .max(1000, "Message must not exceed 1000 characters")
    .trim(),

  metadata: z.record(z.any()).default({}),
});

// ─── Notification ID Param Schema ────────────────────────────────────────────
// Used by notification.routes.js wherever a route includes :id — validates
// the route param itself, not the body, applied via a small inline check
// in the controller rather than the standard validate(schema) middleware
// (which targets req.body), since this guards req.params.id specifically.
export const notificationIdSchema = z.object({
  id: objectIdSchema,
});

// ─── List Notifications Query Schema ─────────────────────────────────────────
// Used by GET /notifications
export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),

  // Filter to only unread, or only read — omitted means "all."
  isRead: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),

  type: z.enum(NOTIFICATION_TYPES).optional(),

  sortBy: z.enum(["createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});