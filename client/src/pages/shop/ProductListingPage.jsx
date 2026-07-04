/**
 * src/pages/shop/ProductListingPage.jsx
 *
 * PURPOSE:
 *   The main product browsing page at /products.
 *   Composes all product module components into a full listing experience:
 *   - Sticky filter sidebar (desktop) / drawer (mobile)
 *   - Sort bar with result count and view toggle
 *   - Product grid with loading skeletons and empty state
 *   - Pagination controls
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   All data flows through useProducts() hook:
 *   useProducts() → useProductStore (filters) → getProducts() → GET /products
 *   Response shape: { products, pagination: { currentPage, totalPages, totalCount } }
 *
 * URL QUERY PARAM SYNC:
 *   On mount, reads ?search= and ?categoryId= from the URL so links like
 *   "Shop Electronics" (from CategoryPreview) pre-filter the listing.
 *   This is the only place URL params are read — the store owns filter state
 *   for the rest of the session.
 *
 * LAYOUT (responsive):
 *   Mobile:  [Filter drawer button] → [Sort bar] → [Grid] → [Pagination]
 *   Desktop: [Filter sidebar | [Sort bar] → [Grid] → [Pagination]]
 *
 * FUTURE PHASES:
 *   Phase 6 (Category) — CategoryPage will reuse this page by passing
 *     { categoryId } as a URL param — already handled by the URL sync below.
 *   Phase 8 (Search) — SearchPage wraps this page, passing `search` param.
 *
 * WHY THIS ARCHITECTURE IS PRODUCTION-READY:
 *   - No data-fetching logic in the component (all in useProducts hook)
 *   - No filter state in the component (all in useProductStore)
 *   - Each visual section is an isolated component
 *   - Pagination uses the backend's pagination object directly
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import { useProducts } from "../../hooks/useProducts";
import { Breadcrumb } from "../../components/common/Breadcrumb/Breadcrumb";
import { ProductGrid } from "../../product/ProductGrid/ProductGrid";
import { ProductSort } from "../../product/ProductSort/ProductSort";
import { ProductFilters } from "../../product/ProductFilters/ProductFilters";

// ── Pagination component (self-contained) ─────────────────────────────────────
function Pagination({ pagination, onPage }) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
  if (totalPages <= 1) return null;

  // Build visible page numbers (max 5 shown, centred on current page)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  };

  const btnBase =
    "min-w-[38px] h-[38px] px-2 rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-150";

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPage(currentPage - 1)}
        disabled={!hasPrevPage}
        className={`${btnBase} border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Previous page"
      >
        ‹
      </button>

      {currentPage > 3 && (
        <>
          <button onClick={() => onPage(1)} className={`${btnBase} border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600`}>
            1
          </button>
          {currentPage > 4 && (
            <span className="text-gray-400 px-1">…</span>
          )}
        </>
      )}

      {getPageNumbers().map((num) => (
        <button
          key={num}
          onClick={() => onPage(num)}
          className={[
            btnBase,
            num === currentPage
              ? "bg-indigo-600 text-white border border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-indigo-900/40"
              : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600",
          ].join(" ")}
          aria-label={`Page ${num}`}
          aria-current={num === currentPage ? "page" : undefined}
        >
          {num}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && (
            <span className="text-gray-400 px-1">…</span>
          )}
          <button
            onClick={() => onPage(totalPages)}
            className={`${btnBase} border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPage(currentPage + 1)}
        disabled={!hasNextPage}
        className={`${btnBase} border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const {
    products, pagination,
    isLoading, isFetching, isError,
    filters, setFilter, setPage, setSort, resetFilters,
    viewMode, setViewMode,
  } = useProducts();

  // ── Sync URL params into store on first mount ──────────────────────────────
  useEffect(() => {
    const params = {};
    if (searchParams.get("q"))          params.search     = searchParams.get("q");
    if (searchParams.get("categoryId")) params.categoryId = searchParams.get("categoryId");
    if (searchParams.get("brand"))      params.brand      = searchParams.get("brand");
    if (searchParams.get("sale"))       params.isFeatured = true;
    if (Object.keys(params).length)     setFilter(params);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close drawer on desktop resize
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setFilterDrawerOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const breadcrumbItems = [{ label: "Products" }];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            All Products
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Discover our complete collection of premium products
          </p>
        </div>

        {/* ── Error state ─────────────────────────────────────────── */}
        {isError && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 px-5 py-4"
          >
            <span className="text-red-500 text-sm font-medium">
              Failed to load products. Please check your connection and try again.
            </span>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-sm text-red-600 dark:text-red-400 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Main layout: sidebar + content ──────────────────────── */}
        <div className="flex gap-7">

          {/* ── Desktop filter sidebar ────────────────────────────── */}
          <aside
            className="hidden lg:block w-60 flex-shrink-0"
            aria-label="Product filters"
          >
            <div className="sticky top-24 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <ProductFilters
                filters={filters}
                onFilter={setFilter}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* ── Content column ────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Mobile filter button + sort bar */}
            <div className="flex items-start sm:items-center gap-3 mb-1">
              {/* Mobile filter trigger */}
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:border-indigo-700 transition-colors flex-shrink-0"
                aria-expanded={filterDrawerOpen}
                aria-controls="filter-drawer"
              >
                <SlidersHorizontal size={15} aria-hidden="true" />
                Filters
              </button>

              {/* Sort bar */}
              <div className="flex-1">
                <ProductSort
                  totalCount={pagination.totalCount}
                  sortBy={filters.sortBy}
                  sortOrder={filters.sortOrder}
                  onSort={setSort}
                  viewMode={viewMode}
                  onViewMode={setViewMode}
                  isFetching={isFetching && !isLoading}
                />
              </div>
            </div>

            {/* Product grid */}
            <div className="mt-5">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                isFetching={isFetching}
                skeletonCount={filters.limit}
                viewMode={viewMode}
                onReset={resetFilters}
                emptyVariant={filters.search ? "search" : "filtered"}
                query={filters.search}
              />
            </div>

            {/* Pagination */}
            {!isLoading && products.length > 0 && (
              <Pagination pagination={pagination} onPage={setPage} />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {filterDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setFilterDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="filter-drawer"
              role="dialog"
              aria-label="Product filters"
              aria-modal="true"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[300px] bg-white dark:bg-gray-950 z-50 shadow-2xl overflow-y-auto lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950 z-10">
                <h2 className="font-bold text-gray-900 dark:text-white">
                  Filters
                </h2>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer content */}
              <div className="p-5">
                <ProductFilters
                  filters={filters}
                  onFilter={(updates) => {
                    setFilter(updates);
                    // Close drawer on mobile after applying filter
                    if (window.innerWidth < 640) setFilterDrawerOpen(false);
                  }}
                  onReset={() => {
                    resetFilters();
                    setFilterDrawerOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}