/**
 * src/store/product.store.js
 *
 * PURPOSE:
 *   Zustand store for product listing UI state — filters, sort order,
 *   pagination, and view mode (grid vs list).
 *
 * WHAT THIS STORE HOLDS VS REACT QUERY:
 *   React Query owns: the actual product data (server cache, loading state)
 *   This store owns: the UI controls that DRIVE the React Query query key
 *
 *   The query key is built FROM this store's state:
 *   useQuery({ queryKey: ["products", filters], queryFn: () => getProducts(filters) })
 *   where `filters` comes from useProductStore().
 *
 *   This separation means:
 *   - Filter state persists when the user navigates to product detail and back
 *   - React Query re-fetches automatically when filters change (key changes)
 *   - Filters can be reset in one action (resetFilters)
 *
 * WHY NOT LOCALSTORAGE:
 *   Filter state is session-scoped. Persisting to localStorage would mean
 *   the user lands on a filtered list on their next visit — unexpected UX.
 *
 * FUTURE PHASES:
 *   Phase 6 (Category Module) — categoryId filter is already in this store.
 *   Phase 8 (Admin) — admin product list uses separate state; this store
 *   is customer-only.
 */

import { create } from "zustand";

// Default filter state — mirrors backend's accepted query param defaults
const DEFAULT_FILTERS = {
  page: 1,
  limit: 12,
  sortBy: "createdAt",
  sortOrder: "desc",
  status: "active",  // always active for customer-facing pages
  // Optional filters — undefined means "not applied"
  categoryId: undefined,
  brand: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  inStock: undefined,
  isFeatured: undefined,
  search: undefined,
};

export const useProductStore = create((set, get) => ({
  // ── Filter state (drives React Query key) ─────────────────────────────
  filters: { ...DEFAULT_FILTERS },

  // ── View mode ─────────────────────────────────────────────────────────
  // "grid" | "list" — persists during the session for better UX
  viewMode: "grid",

  // ── Actions ───────────────────────────────────────────────────────────

  /**
   * Update one or more filters at once.
   * Always resets to page 1 so the user sees results from the start.
   *
   * Usage:
   *   setFilter({ brand: "Apple" })
   *   setFilter({ minPrice: 10000, maxPrice: 50000 })
   */
  setFilter: (updates) =>
    set((state) => ({
      filters: { ...state.filters, ...updates, page: 1 },
    })),

  /**
   * Change the page number without resetting other filters.
   */
  setPage: (page) =>
    set((state) => ({
      filters: { ...state.filters, page },
    })),

  /**
   * Update sort field and direction together.
   */
  setSort: (sortBy, sortOrder = "desc") =>
    set((state) => ({
      filters: { ...state.filters, sortBy, sortOrder, page: 1 },
    })),

  /**
   * Reset all filters back to defaults (but keep viewMode).
   */
  resetFilters: () =>
    set({ filters: { ...DEFAULT_FILTERS } }),

  /**
   * Toggle between grid and list view.
   */
  setViewMode: (viewMode) => set({ viewMode }),

  /**
   * Returns the current filters object — use this as the React Query key.
   * Strips undefined values so they don't appear as query params.
   */
  getCleanFilters: () => {
    const raw = get().filters;
    return Object.fromEntries(
      Object.entries(raw).filter(([, v]) => v !== undefined && v !== "")
    );
  },
}));