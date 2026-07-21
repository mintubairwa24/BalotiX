/**
 * FILE: src/store/adminCategories.store.js
 *
 * ============================================================================
 * ADMIN CATEGORIES STORE — Phase 18B (Category Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Zustand store for the admin Categories table's UI state — search term,
 * active filters (status, parent), sort field/direction, current page, and
 * which category (if any) is queued for deletion. Exact sibling of
 * adminProducts.store.js (Phase 18A) — same shape, same reasoning: this
 * NEVER holds server data (the category list itself lives in React
 * Query's cache, owned by useAdminCategories.js), only the UI controls
 * that shape which query gets fired.
 *
 * WHY QUERY-SHAPING STATE LIVES IN A STORE (not component-local useState):
 * CategorySearch, CategoryFilters, and CategoriesPagination are sibling
 * components — none is an ancestor of the others. Zustand gives all three
 * a shared source of truth without prop-drilling through CategoriesPage,
 * identical reasoning to adminProducts.store.js.
 *
 * WHY changeFilter/changeSearch RESET page TO 1:
 * Same pagination-bug prevention as adminProducts.store.js — changing the
 * query's WHERE clause while sitting on a stale page number would render
 * an empty result set. Only setPage moves the page forward.
 *
 * PARENT FILTER (flagged assumption — see admin.service.js): `parentFilter`
 * lets the admin narrow the table to a specific parent's children, or
 * "none" for top-level categories only. This is a plain string filter,
 * same shape as `status`.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero server data — clean separation from React Query cache (Convention #3)
 * - No persistence — resets on reload, consistent with every store in this
 *   project (Convention #5)
 * - `deleteModalCategoryId` (not a boolean) lets DeleteCategoryModal know
 *   WHICH category it's confirming, without a second piece of state to
 *   keep in sync — same pattern as adminProducts.store.js
 */

import { create } from "zustand";

const DEFAULT_LIMIT = 10;

export const useAdminCategoriesStore = create((set) => ({
  // Query-shaping state
  search: "",
  status: "", // "" = all, "active", "inactive"
  parentFilter: "", // "" = all, "none" = top-level only, or a parent category id
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: DEFAULT_LIMIT,

  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setParentFilter: (parentFilter) => set({ parentFilter, page: 1 }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({ search: "", status: "", parentFilter: "", page: 1 }),

  // Delete confirmation modal — holds the target category's id, not a
  // boolean, so DeleteCategoryModal always knows exactly which category
  // it's acting on.
  deleteModalCategoryId: null,
  openDeleteModal: (categoryId) => set({ deleteModalCategoryId: categoryId }),
  closeDeleteModal: () => set({ deleteModalCategoryId: null }),
}));