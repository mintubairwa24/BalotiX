/**
 * src/store/adminInventory.store.js
 *
 * Zustand store for managing the state of the admin inventory page,
 * including filters, sorting, search, and pagination.
 */

import { create } from "zustand";

export const useAdminInventoryStore = create((set) => ({
  // Filters
  status: "all",
  search: "",
  setStatus: (status) => set({ status, page: 1 }),
  setSearch: (search) => set({ search, page: 1 }),

  // Sorting
  sortBy: "updatedAt",
  sortOrder: "desc",
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  // Pagination
  page: 1,
  setPage: (page) => set({ page }),

  // Reset all filters to default
  resetFilters: () =>
    set({ status: "all", search: "", page: 1, sortBy: "updatedAt", sortOrder: "desc" }),
}));