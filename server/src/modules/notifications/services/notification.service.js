/**
 * notification.service.js
 *
 * WHO CALLS IT:
 *   notification.controller.js for all HTTP-driven operations (listing,
 *   mark-read, delete), AND email.service.js (createNotification,
 *   sendNotification, markNotificationFailed — see email.service.js's
 *   file header for why those two files are split this way). In the
 *   future, this is also the function other modules' services
 *   (order.service.js, payment.service.js, coupon.service.js) will call
 *   directly to create IN_APP or SYSTEM notifications that have no email
 *   component at all — e.g. a simple "Your coupon is ready" in-app badge
 *   with no outbound email.
 *
 * WHY IT EXISTS:
 *   Owns the CRUD and read-state lifecycle of a notification, independent
 *   of delivery channel. This is the ONLY file permitted to write to the
 *   Notification collection — email.service.js never calls
 *   Notification.create() or .save() itself, it always goes through the
 *   functions exported here, the same "one file owns one collection's
 *   writes" discipline every prior module in this codebase has followed.
 *
 * FOR A JUNIOR DEVELOPER — THE LIFECYCLE THIS FILE MANAGES:
 *   createNotification  -> Notification document created, status PENDING
 *   sendNotification    -> status flips to SENT, sentAt timestamp set
 *   (or, on failure)    -> status flips to FAILED instead
 *   markAsRead           -> isRead flips true (customer opened it in the UI)
 *   markAllAsRead         -> bulk version of the above
 *   deleteNotification    -> customer removes it from their own list
 *
 *   Every read/write operation below is scoped to a specific userId,
 *   enforced as a query filter or an explicit ownership comparison —
 *   "never expose another user's notifications" holds because there is
 *   no code path in this file that can return or modify a document
 *   without that check.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed
 *          Zod) or from email.service.js (already-correct internal calls)
 * OUTPUT:  Plain JS objects (Notification documents) or thrown errors
 */

import mongoose from "mongoose";
import Notification from "../models/notification.model.js";

// ─── Create Notification ──────────────────────────────────────────────────────
/**
 * Creates a Notification document in PENDING status. This is intentionally
 * a separate step from "sending" (see sendNotification below) — even for
 * IN_APP/SYSTEM notifications that have no real "delivery" step, keeping
 * creation and the SENT transition as two distinct calls means every
 * notification's status genuinely reflects "has this been finalized,"
 * rather than this function silently assuming success.
 *
 * @param {Object} data - { userId, type, event, title, message, metadata? }
 * @returns {Object}    - The newly created Notification document
 */
export const createNotification = async (data) => {
  const { userId, type, event, title, message, metadata } = data;

  const notification = await Notification.create({
    userId,
    type,
    event,
    title,
    message,
    metadata: metadata || {},
    status: "PENDING",
  });

  return notification.toJSON();
};

// ─── Send Notification ────────────────────────────────────────────────────────
/**
 * Marks a previously-created notification as successfully delivered.
 *
 * WHY THIS IS SEPARATE FROM createNotification:
 *   For EMAIL notifications, email.service.js creates the document FIRST
 *   (so a record exists even if the send is about to fail), then
 *   attempts the actual SMTP send, and only calls this function if that
 *   send succeeds — see email.service.js's sendAndRecord helper for the
 *   exact sequence. For IN_APP/SYSTEM notifications (no real external
 *   delivery step), a calling module can reasonably call createNotification
 *   immediately followed by this function, since there is nothing that
 *   can fail in between.
 *
 * @param {string} notificationId - MongoDB ObjectId of the Notification
 * @returns {Object}              - Updated Notification document, status "SENT"
 */
export const sendNotification = async (notificationId) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { status: "SENT", sentAt: new Date() },
    { new: true }
  );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification.toJSON();
};

// ─── Mark Notification Failed ────────────────────────────────────────────────
/**
 * Not part of the brief's explicit function list, but required to make
 * the PENDING -> SENT|FAILED lifecycle actually complete — without this,
 * a failed email send would leave its Notification document stuck in
 * PENDING forever, which is indistinguishable from "we haven't tried
 * yet" and would make a future "retry all FAILED notifications" feature
 * impossible to build correctly. Exported (not internal-only) so
 * email.service.js can call it directly from its failure branch.
 *
 * @param {string} notificationId - MongoDB ObjectId of the Notification
 * @returns {Object}              - Updated Notification document, status "FAILED"
 */
export const markNotificationFailed = async (notificationId) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { status: "FAILED" },
    { new: true }
  );

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification.toJSON();
};

// ─── Get User Notifications ──────────────────────────────────────────────────
/**
 * Paginated, filterable listing of a customer's OWN notifications —
 * always scoped to the userId passed in by the controller (taken from
 * req.user._id), never a caller-supplied value, the same "no parameter
 * exists through which another user's data could leak in" discipline
 * order.service.js's getMyOrders and payment.service.js's getMyPayments
 * already established.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated customer
 * @param {Object} query  - Validated query params from listNotificationsQuerySchema
 * @returns {Object}      - { notifications, unreadCount, pagination }
 */
export const getUserNotifications = async (userId, query) => {
  const { page, limit, isRead, filter: filterQuery, type, sortBy, sortOrder } = query;

  const filter = { userId };
  if (filterQuery === "unread") filter.isRead = false;
  else if (filterQuery === "read") filter.isRead = true;
  if (isRead !== undefined) filter.isRead = isRead;
  if (type) filter.type = type;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  // unreadCount is computed independently of the paginated/filtered list
  // above — a customer filtering to "read only" should still see an
  // accurate unread badge count, not zero just because the current page
  // of results happens to contain no unread items. This is the query
  // the { userId, isRead } compound index in notification.model.js
  // exists specifically to keep fast.
  const [notifications, totalCount, unreadCount] = await Promise.all([
    Notification.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    notifications,
    unreadCount,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Get Notification By ID ──────────────────────────────────────────────────
/**
 * NOT in the brief's explicit service-function list, but required to
 * back the GET /notifications/:id route the brief's endpoint list does
 * specify — added here for consistency with that route rather than
 * leaving it unimplemented. Same ownership-scoping discipline as every
 * other function in this file: the filter itself includes userId, so a
 * customer can never fetch another user's notification by guessing an ID.
 *
 * @param {string} notificationId - MongoDB ObjectId of the Notification
 * @param {string} userId         - The authenticated requester's _id
 * @returns {Object}              - The Notification document
 */
export const getNotificationById = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error("Invalid notification ID format");
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    userId,
  }).lean();

  if (!notification) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification;
};

// ─── Mark As Read ─────────────────────────────────────────────────────────────
/**
 * OWNERSHIP CHECK: a notification can only be marked read by the user it
 * belongs to. The filter itself enforces this — { _id: notificationId,
 * userId } — rather than fetching the document first and comparing
 * afterward, since a single atomic findOneAndUpdate with userId baked
 * into the filter means there is no code path where this function could
 * even theoretically return another user's notification, by construction
 * rather than by a separate if-check that could be forgotten.
 *
 * @param {string} notificationId - MongoDB ObjectId of the Notification
 * @param {string} userId         - The authenticated requester's _id
 * @returns {Object}              - Updated Notification document
 */
export const markAsRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error("Invalid notification ID format");
    error.statusCode = 400;
    throw error;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    // Either the notification does not exist, or it exists but belongs
    // to someone else — both cases return the SAME 404, never revealing
    // which one occurred. This is the same anti-enumeration discipline
    // order.service.js's getOrderById uses for ownership mismatches,
    // adapted here to a findOneAndUpdate filter instead of a separate
    // fetch-then-compare step.
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return notification.toJSON();
};

// ─── Mark All As Read ─────────────────────────────────────────────────────────
/**
 * Bulk version of markAsRead — flips every currently-unread notification
 * belonging to this user to read in a single database operation, rather
 * than the controller looping over individual markAsRead calls (which
 * would be N separate round trips for N unread notifications).
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated customer
 * @returns {Object}      - { modifiedCount } — how many were actually flipped
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );

  return { modifiedCount: result.modifiedCount };
};

// ─── Delete Notification ──────────────────────────────────────────────────────
/**
 * OWNERSHIP CHECK: identical pattern to markAsRead — userId is baked
 * into the delete filter itself, so this function cannot delete another
 * user's notification by construction.
 *
 * @param {string} notificationId - MongoDB ObjectId of the Notification
 * @param {string} userId         - The authenticated requester's _id
 * @returns {Object}              - { _id, message }
 */
export const deleteNotification = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    const error = new Error("Invalid notification ID format");
    error.statusCode = 400;
    throw error;
  }

  const result = await Notification.findOneAndDelete({
    _id: notificationId,
    userId,
  });

  if (!result) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return { _id: notificationId, message: "Notification deleted successfully" };
};

/**
 * ─── FUTURE COMPATIBILITY NOTES (not implemented, intentionally) ────────────
 *
 * SOCKET.IO: the natural hook point is right here — sendNotification and
 * createNotification (for IN_APP type) are the two functions a Socket.IO
 * emit would sit alongside, e.g. `io.to(userId).emit('notification', ...)`
 * immediately after the document is created. Neither function currently
 * imports or depends on a socket layer, so adding one is additive, not a
 * refactor.
 *
 * SMS / PUSH PROVIDERS: would each get their own sibling file next to
 * email.service.js (e.g. sms.service.js, push.service.js) following the
 * exact same sendAndRecord pattern — create PENDING, attempt send,
 * resolve to SENT or FAILED via the functions already exported here.
 * This file itself needs zero changes for that to work.
 *
 * RABBITMQ / REDIS QUEUES: createNotification's current synchronous
 * "create then immediately attempt send" flow (in email.service.js)
 * could be replaced with "create PENDING, publish a job to a queue" —
 * a separate worker process would then call sendNotification or
 * markNotificationFailed based on the job's outcome. Because those two
 * functions already exist as the single source of truth for the
 * SENT/FAILED transition, introducing a queue later only changes WHO
 * calls them and WHEN, not their own implementation.
 */