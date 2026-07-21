/**
 * FILE: src/store/adminProducts.store.js
 *
 * ============================================================================
 * ADMIN PRODUCTS STORE — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Zustand store for the admin Products table's UI state — search term,
 * active filters, sort field/direction, current page, and which product (if
 * any) is queued for deletion. Exactly like adminDashboard.store.js
 * (Phase 17) and the customer-facing filters.store.js (Phase 7), this NEVER
 * holds server data (the product list itself lives in React Query's cache,
 * owned by useAdminProducts.js) — only the UI controls that shape which
 * query gets fired.
 *
 * WHY QUERY-SHAPING STATE LIVES IN A STORE (not component-local useState):
 * ProductSearch, ProductFilters, and ProductsPagination are separate,
 * sibling components — none of them is an ancestor of the others. A
 * search-term change in ProductSearch has to reset the page in
 * ProductsPagination and re-trigger ProductsTable's query. Zustand gives
 * all three components a shared source of truth without prop-drilling
 * through ProductsPage — the exact same reasoning as filters.store.js in
 * the customer catalog (Phase 7).
 *
 * WHY changeFilter/changeSearch RESET page TO 1:
 * Changing what you're looking for while sitting on page 4 of the OLD
 * result set is a classic pagination bug (page 4 of a 1-page new result set
 * renders empty). Every setter that changes the query's WHERE clause resets
 * `page` back to 1; only setPage itself changes it forward.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero server data — clean separation from React Query cache (Convention #3)
 * - No persistence — resets on reload, consistent with every store in this
 *   project (Convention #5)
 * - `deleteModalProductId` (not a boolean) lets DeleteProductModal know
 *   WHICH product it's confirming, without a second piece of state to keep
 *   in sync
 */

import { create } from "zustand";

const DEFAULT_LIMIT = 10;

export const useAdminProductsStore = create((set) => ({
  // Query-shaping state
  search: "",
  category: "",
  status: "", // "" = all, "active", "inactive"
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: DEFAULT_LIMIT,

  setSearch: (search) => set({ search, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({ search: "", category: "", status: "", page: 1 }),

  // Delete confirmation modal — holds the target product's id, not a boolean,
  // so DeleteProductModal always knows exactly which product it's acting on.
  deleteModalProductId: null,
  openDeleteModal: (productId) => set({ deleteModalProductId: productId }),
  closeDeleteModal: () => set({ deleteModalProductId: null }),
}));