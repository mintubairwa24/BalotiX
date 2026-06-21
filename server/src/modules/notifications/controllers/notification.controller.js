/**
 * notification.controller.js
 *
 * WHO CALLS IT:
 *   notification.routes.js wires each route handler to a function in
 *   this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as every prior module: extract from
 *   req, call service, send response. Zero business logic, zero direct
 *   Notification model access — all of that lives in
 *   notification.service.js. Every method is wrapped in try/catch,
 *   passing errors to next(error) for the global error handler.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as notificationService from "../services/notification.service.js";

// ─── Get User Notifications ──────────────────────────────────────────────────
/**
 * GET /api/notifications
 * Always scoped to req.user._id — see notification.service.js's
 * getUserNotifications for why no caller-supplied userId can ever
 * override this.
 */
export const getUserNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getUserNotifications(
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Notification By ID ──────────────────────────────────────────────────
/**
 * GET /api/notifications/:id
 * See notification.service.js's getNotificationById doc comment for why
 * this exists despite not being in the brief's explicit function list.
 */
export const getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Mark As Read ─────────────────────────────────────────────────────────────
/**
 * PATCH /api/notifications/:id/read
 * Ownership enforced inside notification.service.js's markAsRead.
 */
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Mark All As Read ─────────────────────────────────────────────────────────
/**
 * PATCH /api/notifications/read-all
 * Declared before "/:id/read" in the route file isn't actually required
 * here (the paths are non-conflicting — "read-all" has no :id segment to
 * collide with), but mounted as its own distinct literal path regardless.
 */
export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Notification ──────────────────────────────────────────────────────
/**
 * DELETE /api/notifications/:id
 * Ownership enforced inside notification.service.js's deleteNotification.
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: { _id: result._id },
    });
  } catch (error) {
    next(error);
  }
};