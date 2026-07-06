/**
 * src/components/filters/FilterSidebar/FilterSidebar.jsx
 *
 * PURPOSE:
 *   Desktop-only filter panel for the search results experience. It groups the
 *   reusable filter controls into a single, compact sidebar for large screens.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It does not call the API directly; it writes filter state that the search
 *   hook translates into supported product API query params.
 *
 * FUTURE REUSE:
 *   This panel can be reused by the product listing page or any future listing
 *   experience that needs a persistent desktop filter column.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   The layout is responsive, composable, and easy to extend with more filters.
 */

import { FilterX } from "lucide-react";
import { PriceFilter } from "../PriceFilter/PriceFilter";
import { BrandFilter } from "../BrandFilter/BrandFilter";
import { AvailabilityFilter } from "../AvailabilityFilter/AvailabilityFilter";
import { RatingFilter } from "../RatingFilter/RatingFilter";
import { DiscountFilter } from "../DiscountFilter/DiscountFilter";

export function FilterSidebar({ filters, onFilter, onReset, onClose }) {
  return (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Refine your search</p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 p-2 text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400"
            aria-label="Close filters"
          >
            <FilterX size={14} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <PriceFilter filters={filters} onFilter={onFilter} />
        <BrandFilter filters={filters} onFilter={onFilter} />
        <AvailabilityFilter filters={filters} onFilter={onFilter} />
        <RatingFilter filters={filters} onFilter={onFilter} />
        <DiscountFilter filters={filters} onFilter={onFilter} />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"
      >
        Reset filters
      </button>
    </div>
  );
}
