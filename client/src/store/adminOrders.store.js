/**
 * src/store/adminOrders.store.js
 *
 * ARCHITECTURAL PURPOSE:
 * Zustand store for Admin Order Management UI state — search term,
 * filters, sort field/direction, current page, and modal state.
 *
 * WHY ZUSTAND:
 * Same pattern as adminProducts.store.js, adminCategories.store.js, etc.
 * This store ONLY holds UI state that shapes API queries — NEVER server data.
 * Server data (orders list, order detail) lives in React Query cache,
 * owned by useAdminOrders.js.
 *
 * WHY QUERY-SHAPING STATE LIVES IN A STORE (not component-local useState):
 * OrderSearch, OrderFilters, and OrdersPagination are separate sibling
 * components. Zustand gives all three a shared source of truth without
 * prop-drilling through OrdersPage.
 */

import { create } from "zustand";

const DEFAULT_LIMIT = 10;

export const useAdminOrdersStore = create((set) => ({
  // Query-shaping state — mirrors backend orderQuerySchema
  search: "",
  status: "",
  paymentStatus: "",
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: DEFAULT_LIMIT,

  // Mutators — pagination resets to 1 on any filter/search change
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus, page: 1 }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({
      search: "",
      status: "",
      paymentStatus: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
    }),

  // Update Status Modal state
  updateStatusModal: { isOpen: false, order: null },
  openUpdateStatusModal: (order) =>
    set({ updateStatusModal: { isOpen: true, order } }),
  closeUpdateStatusModal: () =>
    set({ updateStatusModal: { isOpen: false, order: null } }),
}));

