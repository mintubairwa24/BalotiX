/**
 * src/store/notification.store.js
 *
 * PURPOSE:
 *   Holds the unread notification count for the bell icon badge in Header.
 *
 * FUTURE WIRING:
 *   On app mount (authenticated): GET /notifications → response.data.unreadCount
 *   → setUnreadCount(). After PATCH /notifications/read-all → setUnreadCount(0).
 */

import { create } from "zustand";

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  decrement: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
}));