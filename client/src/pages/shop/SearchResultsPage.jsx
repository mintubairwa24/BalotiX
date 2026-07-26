/**
 * src/pages/shop/SearchResultsPage.jsx
 *
 * PURPOSE:
 *   Dedicated search results destination at /search. It orchestrates the search
 *   experience with the reusable search, filter, and product-grid components.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It uses the existing product search endpoint surfaced through the search hook.
 *   The page never constructs ad-hoc endpoints; it always goes through the hook
 *   and the shared product service.
 *
 * FUTURE REUSE:
 *   This page is the foundation for global search, predictive search, and future
 *   product discovery experiences that share the same UX pattern.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It handles loading, empty, and error states while keeping the page layout
 *   modular and responsive across desktop and mobile breakpoints.
 */

import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, SearchX } from "lucide-react";

import { useSearch } from "../../hooks/useSearch";
import { useFilters } from "../../hooks/useFilters";
import { SearchBar } from "../../components/search/SearchBar/SearchBar";
import { FilterSidebar } from "../../components/filters/FilterSidebar/FilterSidebar";
import { SortDropdown } from "../../components/filters/SortDropdown/SortDropdown";
import { FilterChips } from "../../components/filters/FilterChips/FilterChips";
import { ProductGrid } from "../../product/ProductGrid/ProductGrid";
import { Breadcrumb } from "../../components/common/Breadcrumb/Breadcrumb";

function Pagination({ pagination, onPage }) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
  if (totalPages <= 1) return null;

  const btnBase = "min-w-[38px] h-[38px] px-2 rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-150";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPage(currentPage - 1)}
        disabled={!hasPrevPage}
        className={`${btnBase} border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400`}
      >
        ‹
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPage(page)}
          className={`${btnBase} ${page === currentPage ? "bg-indigo-600 text-white" : "border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300"}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPage(currentPage + 1)}
        disabled={!hasNextPage}
        className={`${btnBase} border border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400`}
      >
        ›
      </button>
    </div>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const { query, products, pagination, isLoading, isFetching, isError, error, hasQuery, setQuery, setFilter, setPage, setSort, resetFilters, clearSearch } = useSearch(initialQuery);
  const { filters, activeFilters, isMobileFiltersOpen, setMobileFiltersOpen, clearFilter } = useFilters();

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery, setQuery]);

  const searchSummary = useMemo(() => {
    if (!hasQuery) {
      return "Search for products by name, brand, or keyword";
    }

    return `Showing ${pagination.totalCount} result${pagination.totalCount === 1 ? "" : "s"} for “${query}”`;
  }, [hasQuery, pagination.totalCount, query]);

  const handleSort = (value) => {
    const [sortBy, sortOrder] = value.split("-");
    setSort(sortBy, sortOrder);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: "Search" }]} />

        <div className="mt-5 rounded-3xl border border-gray-200 bg-gray-50/70 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Search products</h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{searchSummary}</p>
            </div>

            <div className="w-full max-w-2xl">
              <SearchBar initialQuery={initialQuery} onSearch={(value) => setQuery(value)} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <FilterChips filters={activeFilters} onRemove={clearFilter} onClearAll={resetFilters} />
        </div>

        <div className="mt-6 flex gap-7">
          <aside className="hidden w-72 shrink-0 lg:block">
            <FilterSidebar filters={filters} onFilter={setFilter} onReset={resetFilters} />
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-300 lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {pagination.totalCount} result{pagination.totalCount === 1 ? "" : "s"}
                </span>
              </div>

              <SortDropdown value={`${filters.sortBy}-${filters.sortOrder}`} onChange={handleSort} />
            </div>

            {isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error?.message ?? "We could not load search results right now."}
              </div>
            )}

            {!isLoading && !hasQuery && (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
                <SearchX className="mx-auto mb-3 text-gray-400" size={32} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Start searching</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Enter a keyword to find matching products.</p>
              </div>
            )}

            <div className="mt-5">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                isFetching={isFetching}
                skeletonCount={12}
                emptyVariant="search"
                query={query}
                onReset={clearSearch}
              />
            </div>

            {!isLoading && products.length > 0 && <Pagination pagination={pagination} onPage={setPage} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-950 lg:hidden"
            >
              <FilterSidebar filters={filters} onFilter={setFilter} onReset={resetFilters} onClose={() => setMobileFiltersOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
