/**
 * src/hooks/useProducts.js
 *
 * PURPOSE:
 *   React Query hook for the product listing page. Bridges:
 *   - useProductStore (filter/sort/page state from Zustand)
 *   - getProducts() (HTTP call from product.service.js)
 *   - React Query cache (stale-while-revalidate server state)
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   GET /products with all active filters as query params.
 *   The query key includes the full filter object — any filter change
 *   triggers an automatic refetch. React Query handles deduplication,
 *   caching, and background revalidation.
 *
 * QUERY KEY DESIGN:
 *   ["products", "list", filters] — structured key allows:
 *   - queryClient.invalidateQueries({ queryKey: ["products"] })
 *     to bust ALL product queries (e.g. after admin creates a product)
 *   - queryClient.invalidateQueries({ queryKey: ["products", "list"] })
 *     to bust only listing queries without touching detail queries
 *
 * RETURN SHAPE:
 *   {
 *     products: Product[],
 *     pagination: { currentPage, totalPages, totalCount, hasNextPage, hasPrevPage },
 *     isLoading, isFetching, isError, error,
 *     filters, setFilter, setPage, setSort, resetFilters, viewMode, setViewMode
 *   }
 *
 * WHY THIS ARCHITECTURE IS PRODUCTION-READY:
 *   Components that use this hook receive everything they need in one
 *   import — data, loading state, and filter controls. They never
 *   directly touch the store or the service.
 *
 * REUSE:
 *   ProductListingPage, CategoryPage, SearchPage all use this hook.
 *   CategoryPage passes { categoryId } as initialFilters.
 *   SearchPage passes { search } as initialFilters.
 */

import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../services/product.service";
import { useProductStore } from "../store/product.store";

export function useProducts() {
  const {
    filters,
    viewMode,
    setFilter,
    setPage,
    setSort,
    resetFilters,
    setViewMode,
    getCleanFilters,
  } = useProductStore();

  // Build the clean filter object (no undefined keys)
  const cleanFilters = getCleanFilters();

  const queryResult = useQuery({
    // Key changes whenever any filter changes → automatic refetch
    queryKey: ["products", "list", cleanFilters],

    queryFn: () =>
      getProducts(cleanFilters).then((res) => res.data),

    // Keep previous data visible while new page/filter is loading
    // This prevents the grid from going blank during pagination
    placeholderData: (previousData) => previousData,

    // Product listings are valid for 2 minutes — balance freshness vs requests
    staleTime: 1000 * 60 * 2,

    // Show error after 1 failed attempt (configured in App.jsx global default)
    retry: 1,
  });

  // Safely extract data with fallback defaults
  const products = queryResult.data?.data?.products ?? [];
  const pagination = queryResult.data?.data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  return {
    // ── Data ──────────────────────────────────────────────────────────
    products,
    pagination,

    // ── Query states ──────────────────────────────────────────────────
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,

    // ── Filter controls (from Zustand) ────────────────────────────────
    filters,
    setFilter,
    setPage,
    setSort,
    resetFilters,

    // ── View mode ─────────────────────────────────────────────────────
    viewMode,
    setViewMode,
  };
}