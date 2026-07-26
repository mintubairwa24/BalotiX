/**
 * src/store/notifications.store.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Manages NOTIFICATION UI STATE ONLY (not server data) — same
 * separation-of-concerns principle as every prior *.store.js in
 * NexCart (cart.store, coupon.store, orders.store, account.store).
 * 
 * React Query owns the server state:
 *   - Notification list + unreadCount — useNotificationsList (this phase)
 *   - Mutations — useMarkAsRead/useMarkAllAsRead/useDeleteNotification
 * 
 * Zustand owns:
 *   - isDropdownOpen — header dropdown visibility, same pattern as
 *     cart.store's isMiniCartOpen (Phase 9)
 *   - activeFilter — "all" | "unread" | "read", used by
 *     NotificationsPage + NotificationFilter (this phase)
 *   - currentPage — pagination state for NotificationsPage, same
 *     pattern as orders.store's currentPage (Phase 14)
 * 
 * PERSISTENCE:
 * Does NOT persist to localStorage. Dropdown closes and page/filter
 * reset on reload — sensible, low-stakes UI defaults.
 */

import { create } from "zustand";

export const useNotificationsStore = create((set) => ({
  // Header dropdown visibility
  isDropdownOpen: false,

  // Current filter for NotificationsPage: "all" | "unread" | "read"
  activeFilter: "all",

  // Current page for NotificationsPage pagination
  currentPage: 1,

  /**
   * Toggle the header notification dropdown
   */
  toggleDropdown: () =>
    set((state) => ({
      isDropdownOpen: !state.isDropdownOpen,
    })),

  /**
   * Explicitly close the dropdown
   * Called on outside-click, route navigation, or after an action
   */
  closeDropdown: () =>
    set(() => ({
      isDropdownOpen: false,
    })),

  /**
   * Set the active filter and reset to page 1
   * (changing filter while on page 3 of a different filter would show
   * a confusing/empty page, so pagination resets alongside the filter)
   * 
   * @param {"all"|"unread"|"read"} filter
   */
  setActiveFilter: (filter) =>
    set(() => ({
      activeFilter: filter,
      currentPage: 1,
    })),

  /**
   * Go to a specific page of NotificationsPage's list
   * @param {number} page
   */
  setCurrentPage: (page) =>
    set(() => ({
      currentPage: page,
    })),
}));