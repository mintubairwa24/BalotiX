/**
 * FILE: src/store/adminInventory.store.js
 *
 * ============================================================================
 * ADMIN INVENTORY STORE — Phase 18F (Inventory Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Zustand store for the admin Inventory table's UI state — search term,
 * status filter, sort field/direction, current page, and which product
 * (if any) has its stock-adjustment modal open. Exact sibling of
 * adminCoupons.store.js/adminProducts.store.js — never holds server data
 * (the inventory list itself lives in React Query's cache, owned by
 * useAdminInventory.js), only the UI controls that shape which query gets
 * fired.
 *
 * WHY QUERY-SHAPING STATE LIVES IN A STORE (not component-local useState):
 * InventorySearch, InventoryFilters, and InventoryPagination are sibling
 * components — none is an ancestor of the others. Zustand gives all three
 * a shared source of truth without prop-drilling through InventoryPage,
 * identical reasoning to every prior admin list store in this project.
 *
 * WHY updateStockModalProductId (NOT A BOOLEAN):
 * Same pattern as every prior delete-modal slice in this project — holding
 * the target product's id (not just an open/closed flag) lets
 * UpdateStockModal know WHICH product's stock it's adjusting, without a
 * second piece of state to keep in sync. This modal isn't destructive
 * (it's an adjustment, not a delete), but the "store holds WHICH item,
 * modal owns the mutation" shape is identical regardless of whether the
 * action is destructive.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero server data — clean separation from React Query cache (Convention #3)
 * - No persistence — resets on reload, consistent with every store in
 *   this project (Convention #5)
 */

import { create } from "zustand";

const DEFAULT_LIMIT = 10;

export const useAdminInventoryStore = create((set) => ({
  // Query-shaping state
  search: "",
  status: "", // "" = all, "in_stock", "low_stock", "out_of_stock"
  sortBy: "updatedAt",
  sortOrder: "desc",
  page: 1,
  limit: DEFAULT_LIMIT,

  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ search: "", status: "", page: 1 }),

  // Stock adjustment modal — holds the target product's id, not a
  // boolean, so UpdateStockModal always knows exactly which product's
  // stock it's acting on.
  updateStockModalProductId: null,
  openUpdateStockModal: (productId) => set({ updateStockModalProductId: productId }),
  closeUpdateStockModal: () => set({ updateStockModalProductId: null }),
}));


export default useAdminInventoryStore; 