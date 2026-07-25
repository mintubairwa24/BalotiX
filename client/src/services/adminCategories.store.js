/**
 * FILE: src/store/adminCategories.store.js
 *
 * ============================================================================
 * ADMIN CATEGORIES STORE — Phase 18B (List/CRUD) + Phase 18D (Hierarchy) Extension
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
 *
 * ---------------------------------------------------------------------------
 * PHASE 18D ADDITIONS — MAPPING THE BRIEF'S STATE CATEGORIES
 * ---------------------------------------------------------------------------
 * Phase 18D asks to separate "Category list state / Selected category
 * state / Filters / Pagination / Search / Hierarchy state / Loading /
 * Errors / Form state." Extending the Phase 18B mapping (list/loading/
 * errors/form-state were already deliberately omitted — server data and
 * React Query's own flags, same reasoning as adminUsers.store.js, Phase
 * 18C):
 *   - Hierarchy state → `viewMode` (table vs. tree) and `expandedNodeIds`
 *     below — genuinely NEW UI state this phase introduces, since Phase
 *     18B had no tree view at all.
 *   - Selected category state → unchanged, still just
 *     `deleteModalCategoryId` (the one thing a modal needs to know).
 *   - Form state → still DELIBERATELY OMITTED. CategoryForm's fields are
 *     local component useState (Phase 18B) — form drafts are inherently
 *     single-screen, ephemeral data with no other component needing to
 *     read them, so promoting them to global Zustand state would violate
 *     Convention #3's UI-state-only rule for no benefit.
 *
 * WHY expandedNodeIds IS A Set, NOT AN ARRAY:
 * Tree expand/collapse is toggled by node id extremely frequently as an
 * admin explores the hierarchy — Set gives O(1) has/add/delete instead of
 * Array's O(n) includes/filter, which matters once a category tree has
 * more than a handful of nodes. Zustand's `set()` still receives a new Set
 * instance on every toggle (never mutated in place) so React's reference-
 * equality change detection keeps working correctly.
 */

import { create } from "zustand";

const DEFAULT_LIMIT = 10;

export const useAdminCategoriesStore = create((set) => ({
  // Query-shaping state
  search: "",
  status: "", // "" = all, "active", "inactive", "deleted" (flagged — see admin.service.js)
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

  // Phase 18D — Hierarchy / view state
  viewMode: "table", // "table" | "tree" — CategoriesPage toggles between CategoriesTable and CategoryTree
  setViewMode: (viewMode) => set({ viewMode }),

  expandedNodeIds: new Set(),
  toggleNodeExpanded: (nodeId) =>
    set((state) => {
      const next = new Set(state.expandedNodeIds);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return { expandedNodeIds: next };
    }),
  expandAllNodes: (nodeIds) => set({ expandedNodeIds: new Set(nodeIds) }),
  collapseAllNodes: () => set({ expandedNodeIds: new Set() }),
}));