/**
 * src/store/orders.store.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Manages ORDER HISTORY UI STATE ONLY (not server data).
 * 
 * React Query owns the server state:
 *   - Paginated order list — useOrdersList (this phase)
 *   - Single order details — useOrderDetails (this phase)
 *   - Cancellation result — useCancelOrder (this phase)
 * 
 * Zustand owns:
 *   - currentPage (which page of order history is being viewed)
 *   - isCancelModalOpen / orderIdPendingCancel (confirmation dialog
 *     before actually calling cancelOrder — cancelling an order is a
 *     destructive, irreversible action and deserves a confirm step,
 *     same pattern as AddressList's window.confirm in Phase 11, but
 *     implemented as store state here so OrderDetailsPage can render a
 *     proper modal instead of a native browser confirm dialog)
 * 
 * PERSISTENCE:
 * Does NOT persist to localStorage. Page resets to 1 on remount —
 * acceptable since order history isn't a place users expect deep-linked
 * pagination state to survive a full reload.
 */

import { create } from "zustand";

export const useOrdersStore = create((set) => ({
  // Current page of the paginated orders list
  currentPage: 1,

  // Cancel confirmation modal state
  isCancelModalOpen: false,
  orderIdPendingCancel: null,

  /**
   * Go to a specific page of order history
   * @param {number} page
   */
  setCurrentPage: (page) =>
    set(() => ({
      currentPage: page,
    })),

  /**
   * Reset pagination back to page 1
   * Called when navigating away from OrdersPage
   */
  resetPage: () =>
    set(() => ({
      currentPage: 1,
    })),

  /**
   * Open the cancel-confirmation modal for a specific order
   * @param {string} orderId
   */
  openCancelModal: (orderId) =>
    set(() => ({
      isCancelModalOpen: true,
      orderIdPendingCancel: orderId,
    })),

  /**
   * Close the cancel-confirmation modal without cancelling
   */
  closeCancelModal: () =>
    set(() => ({
      isCancelModalOpen: false,
      orderIdPendingCancel: null,
    })),
}));