/**
 * src/hooks/useSearch.js
 *
 * PURPOSE:
 *   The main orchestration hook for the search experience. It combines the
 *   debounced query, the Zustand filter state, and the backend product search API.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It calls the existing product service using GET /products/search?q= for the
 *   main search API, and it uses GET /products with the same filter params to
 *   preserve the backend-supported filtering contract.
 *
 * FUTURE REUSE:
 *   This hook can power the homepage search overlay, category-specific search,
 *   and any other search-driven surfaces without changing the page component.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It keeps API request logic out of the page and supports graceful loading,
 *   error, and empty states while respecting the backend contract.
 */

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";
import { searchProductsWithFilters } from "../services/product.service";
import { useSearchStore } from "../store/search.store";

const DEFAULT_PAGINATION = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export function useSearch(initialQuery = "") {
  const { query, filters, setQuery, setFilter, setPage, setSort, resetFilters, clearSearch } = useSearchStore();
  const activeQuery = initialQuery ?? query;
  const debouncedQuery = useDebounce(activeQuery, 400);

  useEffect(() => {
    if (initialQuery !== undefined && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query, setQuery]);

  const apiFilters = useMemo(() => {
    const normalized = {
      page: filters.page,
      limit: filters.limit,
      brand: filters.brand,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      inStock: filters.availability === "inStock" ? true : undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      search: debouncedQuery.trim() || undefined,
    };

    return Object.fromEntries(
      Object.entries(normalized).filter(([, value]) => value !== undefined && value !== "")
    );
  }, [debouncedQuery, filters.page, filters.limit, filters.brand, filters.minPrice, filters.maxPrice, filters.availability, filters.sortBy, filters.sortOrder]);

  const queryResult = useQuery({
    queryKey: ["search", "results", apiFilters],
    enabled: debouncedQuery.trim().length > 0,
    queryFn: async () => {
      const response = await searchProductsWithFilters(debouncedQuery.trim(), apiFilters);
      const payload = response.data?.data ?? {};
      const backendProducts = payload.products ?? [];

      let products = [...backendProducts];

      if (filters.rating) {
        const minimumRating = Number(filters.rating);
        products = products.filter((product) => Number(product.averageRating ?? 0) >= minimumRating);
      }

      if (filters.discount) {
        const minimumDiscount = Number(filters.discount);
        products = products.filter(
          (product) => Number(product.discountPercentage ?? 0) >= minimumDiscount
        );
      }

      const totalCount = products.length;
      const limit = Number(filters.limit) || 12;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const currentPage = Math.min(Number(filters.page) || 1, totalPages);
      const startIndex = (currentPage - 1) * limit;

      return {
        products: products.slice(startIndex, startIndex + limit),
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
        },
      };
    },
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  return {
    query: debouncedQuery,
    filters,
    products: queryResult.data?.products ?? [],
    pagination: queryResult.data?.pagination ?? DEFAULT_PAGINATION,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    isError: queryResult.isError,
    error: queryResult.error,
    hasQuery: debouncedQuery.trim().length > 0,
    setQuery,
    setFilter,
    setPage,
    setSort,
    resetFilters,
    clearSearch,
  };
}
