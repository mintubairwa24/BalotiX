/**
 * src/store/adminOrders.store.js
 *
 * ARCHITECTURAL PURPOSE:
 * Zustand store for managing the UI state of the Admin Order Management module.
 * This store is the single source of truth for client-side state that is NOT
 * server cache data. This includes:
 *
 * - Query parameters for the orders list (pagination, filters, sorting).
 * - State for modals (e.g., which modal is open, what order it pertains to).
 * - Search input values.
 *
 * WHY ZUSTAND:
 * Chosen for its simplicity, minimal boilerplate, and hook-based API that
 * integrates cleanly with React components without requiring context providers.
 *
 * WHY NOT IN REACT QUERY:
 * React Query is for managing SERVER STATE (caching, refetching, mutations).
 * This store manages UI STATE. Keeping them separate prevents unnecessary
 * re-renders of components that only care about UI state when server data
 * changes, and vice-versa.
 *
 * REUSED/EXTENDED BY:
 * - useAdminOrders.js (reads query params to pass to API calls)
 * - OrdersPage.jsx (reads/sets query params, controls modals)
 * - OrderFilters.jsx, OrderSearch.jsx, OrdersPagination.jsx (interact with query params)
 * - UpdateStatusModal.jsx, etc. (interact with modal state)
 */

import { create } from 'zustand';

export const useAdminOrdersStore = create((set, get) => ({
  // Query parameters for the main orders list
  queryParams: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: '',
    paymentStatus: '',
    search: '',
  },

  // State for modals
  modalState: {
    updateStatus: { isOpen: false, order: null },
    refund: { isOpen: false, order: null },
  },

  // Actions to update state
  setQueryParams: (params) =>
    set((state) => ({
      queryParams: { ...state.queryParams, ...params },
    })),

  setPage: (page) =>
    set((state) => ({
      queryParams: { ...state.queryParams, page },
    })),

  setSearch: (search) =>
    set((state) => ({
      queryParams: { ...state.queryParams, search, page: 1 }, // Reset to page 1 on new search
    })),

  openModal: (modal, order) =>
    set((state) => ({
      modalState: { ...state.modalState, [modal]: { isOpen: true, order } },
    })),

  closeModal: (modal) =>
    set((state) => ({
      modalState: { ...state.modalState, [modal]: { isOpen: false, order: null } },
    })),

  // Utility to get the current query params for API calls
  getApiQueryParams: () => get().queryParams,
}));
