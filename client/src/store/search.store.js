/**
 * src/store/search.store.js
 *
 * PURPOSE:
 *   Central Zustand store for the search experience. It owns the user-entered
 *   query plus the advanced filter state that drives the search results page.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   The store does not call the API directly. Instead, the search hook reads
 *   this state and turns it into supported query params for GET /products and
 *   GET /products/search.
 *
 * FUTURE REUSE:
 *   The same store can power future search-driven modules such as homepage
 *   search overlays, category search, and a unified product discovery experience.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   The UI state stays predictable, serializable, and easy to sync with the URL.
 */

import { create } from "zustand";

export const DEFAULT_SEARCH_FILTERS = {
  page: 1,
  limit: 12,
  sortBy: "createdAt",
  sortOrder: "desc",
  brand: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  availability: "all",
  rating: undefined,
  discount: undefined,
};

export const useSearchStore = create((set, get) => ({
  query: "",
  filters: { ...DEFAULT_SEARCH_FILTERS },
  isMobileFiltersOpen: false,

  setQuery: (query) =>
    set((state) => ({
      query,
      filters: { ...state.filters, page: 1 },
    })),

  setFilter: (updates) =>
    set((state) => ({
      filters: { ...state.filters, ...updates, page: 1 },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),

  setSort: (sortBy, sortOrder = "desc") =>
    set((state) => ({
      filters: { ...state.filters, sortBy, sortOrder, page: 1 },
    })),

  resetFilters: () =>
    set((state) => ({
      filters: { ...DEFAULT_SEARCH_FILTERS },
      isMobileFiltersOpen: false,
      query: state.query,
    })),

  clearSearch: () =>
    set({
      query: "",
      filters: { ...DEFAULT_SEARCH_FILTERS },
      isMobileFiltersOpen: false,
    }),

  toggleMobileFilters: () =>
    set((state) => ({ isMobileFiltersOpen: !state.isMobileFiltersOpen })),

  setMobileFiltersOpen: (value) => set({ isMobileFiltersOpen: value }),

  getCleanFilters: () => {
    const raw = get().filters;
    return Object.fromEntries(
      Object.entries(raw).filter(([, value]) => value !== undefined && value !== "")
    );
  },
}));
