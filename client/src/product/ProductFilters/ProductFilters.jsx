/**
 * src/components/product/ProductFilters/ProductFilters.jsx
 *
 * PURPOSE:
 *   Filter sidebar/drawer for ProductListingPage. Controls:
 *   - Price range (min/max in paise → display in rupees)
 *   - In Stock toggle
 *   - On Sale toggle
 *   - Brand filter (static list now, dynamic from API in Phase 6)
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   All filter values map directly to backend query params
 *   (PROJECT_CONTEXT.md Part 4 — Product listing query params):
 *   minPrice, maxPrice, inStock, isFeatured, brand
 *
 *   Price values are stored internally as rupees (user input) and
 *   converted to paise before being passed to the backend:
 *   rupees × 100 = paise (backend expects paise)
 *
 * WHY PRICE IS IN PAISE:
 *   PROJECT_CONTEXT.md Part 10, Rule 8: ALL money values from the API
 *   are in paise (smallest INR unit). 119900 = ₹1,19,900.
 *   This component converts: user inputs rupees → store sends paise.
 *
 * PHASE 6 CONNECTION (Category Module):
 *   The categoryId filter input is prepared but empty for now.
 *   Phase 6 fetches categories via GET /categories and renders them
 *   as checkboxes in a "Category" section added to this component.
 *
 * PROPS:
 *   filters     → current filter state from useProductStore
 *   onFilter    → (updates: Object) => void  (setFilter from useProducts)
 *   onReset     → () => void                 (resetFilters from useProducts)
 *   isMobile    → boolean — renders as full drawer content on mobile
 */

import { useState } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

// Static brand list — Phase 6 will fetch brands from GET /products/brands
const POPULAR_BRANDS = [
  "Apple", "Samsung", "Sony", "OnePlus", "Dell",
  "Bose", "Canon", "JBL", "Logitech",
];

export function ProductFilters({ filters, onFilter, onReset }) {
  // Local rupee state for price inputs (converted to paise for the store)
  const [minRupees, setMinRupees] = useState(
    filters.minPrice ? filters.minPrice / 100 : ""
  );
  const [maxRupees, setMaxRupees] = useState(
    filters.maxPrice ? filters.maxPrice / 100 : ""
  );

  const applyPriceFilter = () => {
    onFilter({
      minPrice: minRupees ? Number(minRupees) * 100 : undefined,
      maxPrice: maxRupees ? Number(maxRupees) * 100 : undefined,
    });
  };

  const handleReset = () => {
    setMinRupees("");
    setMaxRupees("");
    onReset();
  };

  const activeBrand = filters.brand;
  const isInStock = filters.inStock === true || filters.inStock === "true";
  const isOnSale = filters.isFeatured === true || filters.isFeatured === "true";

  const hasActiveFilters =
    filters.minPrice || filters.maxPrice || filters.brand ||
    filters.inStock || filters.isFeatured;

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="text-[10px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
          >
            <RotateCcw size={11} aria-hidden="true" />
            Reset
          </button>
        )}
      </div>

      {/* ── Price Range ───────────────────────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Price Range (₹)
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minRupees}
            onChange={(e) => setMinRupees(e.target.value)}
            onBlur={applyPriceFilter}
            min={0}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Minimum price in rupees"
          />
          <span className="text-gray-400 text-sm flex-shrink-0">to</span>
          <input
            type="number"
            placeholder="Max"
            value={maxRupees}
            onChange={(e) => setMaxRupees(e.target.value)}
            onBlur={applyPriceFilter}
            min={0}
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label="Maximum price in rupees"
          />
        </div>
      </div>

      {/* ── Availability ─────────────────────────────────────────────── */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Availability
        </h4>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isInStock}
                onChange={(e) =>
                  onFilter({ inStock: e.target.checked ? true : undefined })
                }
              />
              <div className="w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              In Stock Only
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isOnSale}
                onChange={(e) =>
                  onFilter({ isFeatured: e.target.checked ? true : undefined })
                }
              />
              <div className="w-10 h-5 rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              On Sale
            </span>
          </label>
        </div>
      </div>

      {/* ── Brand ──────────────────────────────────────────────────────── */}
      {/*
        PHASE 6 UPGRADE:
        Replace POPULAR_BRANDS with a React Query fetch:
        GET /products?status=active → extract unique brands from results
        or a dedicated GET /products/brands endpoint if added to backend.
      */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Brand
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
          {POPULAR_BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="brand-filter"
                className="sr-only peer"
                checked={activeBrand === brand}
                onChange={() =>
                  onFilter({ brand: activeBrand === brand ? undefined : brand })
                }
              />
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 flex items-center justify-center transition-colors flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 peer-checked:opacity-100" />
              </div>
              <span className={[
                "text-sm transition-colors",
                activeBrand === brand
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white",
              ].join(" ")}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}