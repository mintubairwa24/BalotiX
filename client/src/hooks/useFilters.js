/**
 * src/hooks/useFilters.js
 *
 * PURPOSE:
 *   A thin adapter over the search store that turns raw filter state into the
 *   UI-friendly shape consumed by the search page and filter components.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It does not fetch data itself. Instead, it prepares the active filter list
 *   and exposes the store actions that the search hook later translates into
 *   supported product API params.
 *
 * FUTURE REUSE:
 *   This hook is intentionally UI-centric so future discovery surfaces can
 *   reuse the same active-filter chips and clear actions without duplicating logic.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   Filter state is normalized once and reused across the page, drawer, and chips.
 */

import { useMemo } from "react";
import { useSearchStore } from "../store/search.store";

export function useFilters() {
  const {
    filters,
    isMobileFiltersOpen,
    toggleMobileFilters,
    setMobileFiltersOpen,
    setFilter,
    setPage,
    setSort,
    resetFilters,
  } = useSearchStore();

  const activeFilters = useMemo(() => {
    const items = [];

    if (filters.brand) {
      items.push({ key: "brand", label: `Brand: ${filters.brand}` });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice ?? "";
      const max = filters.maxPrice ?? "";
      const label = min && max ? `Price: ₹${min} – ₹${max}` : min ? `Min: ₹${min}` : `Max: ₹${max}`;
      items.push({ key: "price", label });
    }

    if (filters.availability !== "all") {
      items.push({ key: "availability", label: filters.availability === "inStock" ? "In stock only" : filters.availability });
    }

    if (filters.rating) {
      items.push({ key: "rating", label: `${filters.rating}+ stars` });
    }

    if (filters.discount) {
      items.push({ key: "discount", label: `${filters.discount}%+ off` });
    }

    return items;
  }, [filters]);

  const clearFilter = (filterKey) => {
    if (filterKey === "availability") {
      setFilter({ availability: "all" });
      return;
    }

    if (filterKey === "price") {
      setFilter({ minPrice: undefined, maxPrice: undefined });
      return;
    }

    setFilter({ [filterKey]: undefined });
  };

  return {
    filters,
    activeFilters,
    hasActiveFilters: activeFilters.length > 0,
    isMobileFiltersOpen,
    toggleMobileFilters,
    setMobileFiltersOpen,
    setFilter,
    setPage,
    setSort,
    resetFilters,
    clearFilter,
  };
}
