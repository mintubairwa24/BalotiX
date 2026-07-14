/**
 * src/hooks/useNotifications.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Notification-specific React Query hooks — the single place components
 * reach for notification data and actions.
 * 
 * Provides:
 * 1. useNotificationsList(page, limit, filter) - paginated list +
 *    unreadCount, used by BOTH NotificationDropdown (page=1, small
 *    limit) and NotificationsPage (full pagination)
 * 2. useMarkAsRead(options) - single-notification mutation
 * 3. useMarkAllAsRead(options) - bulk mutation
 * 4. useDeleteNotification(options) - optional, see notification.service.js
 * 
 * WHY THE DROPDOWN AND PAGE SHARE ONE LIST HOOK:
 * Rather than a separate "recent notifications" endpoint/hook for the
 * dropdown, it simply calls useNotificationsList(1, 5) — same backend
 * endpoint, smaller page size. This avoids maintaining two parallel
 * data-fetching paths for what is fundamentally the same resource,
 * consistent with how MiniCart (Phase 9) reuses useCartQuery rather
 * than having its own cart-fetching logic.
 * 
 * CACHE STRATEGY:
 * - List cached per {page, limit, filter} combination, same pattern as
 *   useOrdersList (Phase 14)
 * - Any mutation (mark-read, mark-all-read, delete) invalidates ALL
 *   ["notifications"] queries (regardless of page/filter) via a
 *   partial key match, since isRead/unreadCount changes affect every
 *   cached page simultaneously — using the base key without page/filter
 *   ensures the badge, dropdown, and full page all refresh together
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as notificationService from "../services/notification.service";

const NOTIFICATIONS_BASE_KEY = ["notifications"];

/**
 * Fetch a paginated (optionally filtered) list of notifications
 * 
 * @param {number} page
 * @param {number} limit
 * @param {string} [filter] - "all" | "unread" | "read"
 * @returns {Object} { data: { notifications, unreadCount, pagination }, isLoading, isError }
 * 
 * USAGE:
 * // Dropdown — small recent list
 * const { data } = useNotificationsList(1, 5);
 * 
 * // Full page — larger, paginated
 * const { data } = useNotificationsList(currentPage, 15, activeFilter);
 */
export const useNotificationsList = (
  page = 1,
  limit = 10,
  filter,
  options = {}
) => {
  return useQuery({
    queryKey: [...NOTIFICATIONS_BASE_KEY, { page, limit, filter }],
    queryFn: async () => {
      const params = { page, limit };
      if (filter && filter !== "all") params.filter = filter;
      const response = await notificationService.getNotifications(params);
      return response.data.data;
    },
    enabled: options.enabled ?? true,
    staleTime: 1000 * 30, // 30s — notifications are semi-live, not instant
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Mark a single notification as read
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: markRead } = useMarkAsRead();
 * markRead(notificationId);
 * 
 * Called from NotificationItem's onClick, ALONGSIDE navigation to
 * actionUrl (not blocking it — see NotificationItem for the
 * fire-and-forget pattern used so clicking feels instant).
 */
export const useMarkAsRead = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
    onSuccess: (response, notificationId) => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_BASE_KEY });
      if (options.onSuccess) options.onSuccess(notificationId);
    },
    onError: (error) => {
      if (options.onError) options.onError(error);
      // Deliberately no toast here — a failed "mark as read" on a
      // background click shouldn't interrupt the user with an error
      // popup; it will simply retry to show as unread next fetch.
    },
  });
};

/**
 * Mark ALL notifications as read
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: markAllRead, isPending } = useMarkAllAsRead();
 * markAllRead();
 */
export const useMarkAllAsRead = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_BASE_KEY });
      toast.success("All notifications marked as read");

      if (options.onSuccess) options.onSuccess();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to mark all as read";
      toast.error(message);

      if (options.onError) options.onError(error);
    },
  });
};

/**
 * Delete a single notification
 * 
 * OPTIONAL — see notification.service.js's deleteNotification() and
 * NotificationItem's comments on conditional rendering.
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 */
export const useDeleteNotification = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) =>
      notificationService.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_BASE_KEY });
      toast.success("Notification removed");

      if (options.onSuccess) options.onSuccess();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to remove notification";
      toast.error(message);

      if (options.onError) options.onError(error);
    },
  });
};