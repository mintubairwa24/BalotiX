/**
 * src/components/product/ProductSort/ProductSort.jsx
 *
 * PURPOSE:
 *   Sort control bar for ProductListingPage. Shows:
 *   - Total product count
 *   - Sort dropdown (by relevance, price, rating, newest)
 *   - Grid/list view toggle
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   The `sortBy` and `sortOrder` values map directly to the backend's
 *   supported sort params (PROJECT_CONTEXT.md Part 4):
 *   sortBy: "price" | "createdAt" | "averageRating" | "name"
 *   sortOrder: "asc" | "desc"
 *
 * WHY IT IS SEPARATE FROM PRODUCTFILTERS:
 *   Sort is a top-of-page quick control — always visible.
 *   Filters are a sidebar/drawer — collapsible.
 *   Separating them allows different responsive layouts:
 *   mobile → sort bar at top, filters in drawer
 *   desktop → sort bar at top, filter sidebar on left
 *
 * PROPS:
 *   totalCount → number (from pagination.totalCount)
 *   sortBy     → current sortBy value
 *   sortOrder  → current sortOrder value
 *   onSort     → (sortBy, sortOrder) => void
 *   viewMode   → "grid" | "list"
 *   onViewMode → (mode) => void
 *   isFetching → boolean — shows subtle indicator during background refetch
 */

import { LayoutGrid, List, ArrowUpDown } from "lucide-react";

const SORT_OPTIONS = [
  { label: "Newest First",    sortBy: "createdAt",    sortOrder: "desc" },
  { label: "Oldest First",    sortBy: "createdAt",    sortOrder: "asc"  },
  { label: "Price: Low → High", sortBy: "price",      sortOrder: "asc"  },
  { label: "Price: High → Low", sortBy: "price",      sortOrder: "desc" },
  { label: "Top Rated",       sortBy: "averageRating", sortOrder: "desc" },
  { label: "Name: A → Z",    sortBy: "name",          sortOrder: "asc"  },
];

export function ProductSort({
  totalCount = 0,
  sortBy = "createdAt",
  sortOrder = "desc",
  onSort,
  viewMode = "grid",
  onViewMode,
  isFetching = false,
}) {
  const currentValue = `${sortBy}:${sortOrder}`;

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split(":");
    onSort?.(newSortBy, newSortOrder);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 border-b border-gray-100 dark:border-gray-800">
      {/* Left — result count */}
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">
            {totalCount.toLocaleString("en-IN")}
          </span>{" "}
          {totalCount === 1 ? "product" : "products"} found
        </p>
        {/* Background refetch indicator */}
        {isFetching && (
          <div
            className="w-4 h-4 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"
            aria-label="Updating results..."
          />
        )}
      </div>

      {/* Right — sort + view controls */}
      <div className="flex items-center gap-3">
        {/* Sort dropdown */}
        <div className="relative flex items-center gap-1.5">
          <ArrowUpDown size={14} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
          <select
            value={currentValue}
            onChange={handleSortChange}
            className="text-sm text-gray-700 dark:text-gray-200 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 pr-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer appearance-none"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option
                key={`${opt.sortBy}:${opt.sortOrder}`}
                value={`${opt.sortBy}:${opt.sortOrder}`}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle */}
        <div className="hidden sm:flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          <button
            onClick={() => onViewMode?.("grid")}
            className={[
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              viewMode === "grid"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
            ].join(" ")}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => onViewMode?.("list")}
            className={[
              "w-7 h-7 rounded-lg flex items-center justify-center transition-colors",
              viewMode === "list"
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
            ].join(" ")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}