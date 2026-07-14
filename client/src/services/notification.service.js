/**
 * src/services/notification.service.js  (EXTENDED — Phase 16)
 * 
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all Notification backend interactions. If a
 * notification.service.js already existed from an earlier phase (e.g.
 * a minimal version created alongside order/payment notifications),
 * this EXTENDS it with the full CRUD-ish surface this phase needs —
 * merge these exports into your existing file rather than duplicating.
 * 
 * ASSUMPTIONS FLAGGED FOR BACKEND VERIFICATION:
 * - GET /notifications?page=&limit=&filter= for a paginated list,
 *   mirroring the exact pagination convention already established in
 *   order.service.js (Phase 14) — `page`/`limit` query params, response
 *   containing a `pagination` object. If your backend paginates
 *   differently, only getNotifications() needs updating.
 * - The list response is assumed to include `unreadCount` alongside the
 *   items (similar to how Phase 9's cart response includes `itemCount`)
 *   so the header badge doesn't need a SEPARATE network call just to
 *   show a number — one list fetch serves both the dropdown/page AND
 *   the badge. If your backend only exposes unread count via a
 *   dedicated endpoint, add getUnreadCount() here and swap
 *   NotificationBadge's data source (isolated change, see
 *   useNotifications.js comments).
 * - Mark-as-read: PATCH /notifications/:id/read
 * - Mark-all-as-read: PATCH /notifications/mark-all-read
 * - Delete: DELETE /notifications/:id — EXPLICITLY OPTIONAL per this
 *   phase's instructions. NotificationItem/NotificationActions only
 *   render delete UI when this succeeds; if your backend has no delete
 *   endpoint, never wire deleteNotification() into the UI (see
 *   NotificationItem's comments) and everything else still works.
 * - Filtering: `filter` query param, assumed values "all" | "unread" |
 *   "read" — ALSO EXPLICITLY OPTIONAL. If your backend doesn't support
 *   server-side filtering, NotificationFilter can still filter the
 *   already-fetched page client-side (documented in that component) —
 *   either way no invented backend behavior.
 * 
 * NOTIFICATION SHAPE (assumed):
 * {
 *   _id, title, message, type: "order"|"payment"|"promotion"|"system",
 *   isRead: boolean, actionUrl: string|null,  // e.g. "/orders/:id"
 *   createdAt: ISO timestamp
 * }
 */

import  api  from "../api/axios";

const NOTIFICATION_ENDPOINTS = {
  GET_ALL: "/notifications",
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: "/notifications/read-all",
  DELETE: (id) => `/notifications/${id}`,
};

/**
 * Fetch a paginated list of the current user's notifications
 * 
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} [params.filter] - "all" | "unread" | "read" (optional,
 *   only sent if provided — see NotificationFilter for how this is
 *   conditionally used)
 * 
 * @returns {Promise} Axios response
 * 
 * RESPONSE SHAPE (assumed):
 * {
 *   success: true,
 *   data: {
 *     notifications: [{ _id, title, message, type, isRead, actionUrl, createdAt }],
 *     unreadCount: number,
 *     pagination: { page, limit, totalNotifications, totalPages }
 *   }
 * }
 */
export const getNotifications = (params = { page: 1, limit: 10 }) => {
  return api.get(NOTIFICATION_ENDPOINTS.GET_ALL, { params });
};

/**
 * Mark a single notification as read
 * 
 * @param {string} notificationId
 * @returns {Promise} Axios response with updated notification
 * 
 * WHEN CALLED:
 * - User clicks a notification (NotificationItem) — mark-as-read fires
 *   alongside navigation to actionUrl, not instead of it
 */
export const markAsRead = (notificationId) => {
  return api.patch(NOTIFICATION_ENDPOINTS.MARK_READ(notificationId));
};

/**
 * Mark ALL of the current user's notifications as read
 * 
 * @returns {Promise} Axios response
 * 
 * WHEN CALLED:
 * - User clicks "Mark all as read" (NotificationActions)
 */
export const markAllAsRead = () => {
  return api.patch(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
};

/**
 * Delete a single notification
 * 
 * OPTIONAL — only call this if your backend implements it. See
 * NotificationItem's comments for how the delete button is
 * conditionally rendered.
 * 
 * @param {string} notificationId
 * @returns {Promise} Axios response
 * 
 * ERRORS:
 * - 404: Notification not found
 * - 403: Notification belongs to a different user
 */
export const deleteNotification = (notificationId) => {
  return api.delete(NOTIFICATION_ENDPOINTS.DELETE(notificationId));
};