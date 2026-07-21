/**
 * src/pages/shop/CategoryPage.jsx
 *
 * PURPOSE:
 *   The category detail page at /category/:slug.
 *   Composes all category and product components:
 *   - CategoryHeader (category name, description, image)
 *   - CategorySidebar (collapsible tree of all categories)
 *   - CategoryGrid (sub-categories of the current category)
 *   - ProductGrid (products filtered by this category)
 *   - ProductSort (sort controls for the product grid)
 *   - Pagination (for the product list)
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Two parallel data concerns:
 *   1. useCategory(slug)  → GET /categories/slug/:slug + GET /categories/:id/breadcrumb
 *      Provides: category details, breadcrumb ancestors
 *
 *   2. useProducts()      → GET /products?categoryId=<id>&status=active
 *      Provides: products belonging to this category, pagination
 *      The categoryId filter is set in useProductStore via setFilter()
 *      — the exact same hook and store used by ProductListingPage.
 *      This means all ProductListingPage filtering patterns work here too.
 *
 * CRITICAL: useProductStore FILTER ISOLATION
 *   When CategoryPage mounts, it calls setFilter({ categoryId }) to scope
 *   the product grid to this category. When it unmounts, it calls resetFilters()
 *   to clear the category scope — otherwise the filter leaks into ProductListingPage.
 *   This is handled in the useEffect cleanup below.
 *
 * LAYOUT (responsive):
 *   Mobile:  [Header] → [Sub-categories grid] → [Sort bar] → [Products] → [Pagination]
 *   Tablet:  [Header] → [Sub-categories] → [Sort] → [Products] → [Pagination]
 *   Desktop: [Header] | [Sidebar] + [Sub-categories] + [Sort] + [Products] + [Pagination]
 *
 * FUTURE PHASES:
 *   Phase 7 (Cart/Wishlist) — ProductGrid cards will have working cart buttons.
 *   Phase 8 (Admin) — category edit button visible when user.role === "admin".
 */

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, FolderX } from "lucide-react";

import { useCategory } from "../../hooks/useCategory";
import { useCategories } from "../../hooks/useCategories";
import { useProducts } from "../../hooks/useProducts";

import { CategoryHeader } from "../../components/category/CategoryHeader/CategoryHeader";
import { CategorySidebar } from "../../components/category/CategorySidebar/CategorySidebar";
import { CategoryGrid } from "../../components/category/CategoryGrid/CategoryGrid";
import { CategoryEmpty } from "../../components/category/CategoryEmpty/CategoryEmpty";
import { ProductGrid } from "../../product/ProductGrid/ProductGrid";
import { ProductSort } from "../../product/ProductSort/ProductSort";
import { useCategoryStore } from "../../store/category.store";
import { ROUTES } from "../../constants/route.constants";

// ── Reused from ProductListingPage (extracted inline for self-containment) ─────
function Pagination({ pagination, onPage }) {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
  if (totalPages <= 1) return null;

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
          {currentPage > 4 && <span className="text-gray-400 px-1">…</span>}
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
          {currentPage < totalPages - 3 && <span className="text-gray-400 px-1">…</span>}
          <button onClick={() => onPage(totalPages)} className={`${btnBase} border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600`}>
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
export default function CategoryPage1() {
  const { slug } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Category data ─────────────────────────────────────────────────────────
  const {
    category,
    breadcrumb,
    isLoading: categoryLoading,
    isError: categoryError,
    isNotFound,
  } = useCategory(slug);

  // ── All categories for the sidebar tree ───────────────────────────────────
  const {
    categories: allCategories,
    isLoading: categoriesLoading,
  } = useCategories();

  // ── Category store — set active + expand ancestors ────────────────────────
  const { setActive, expandAncestors } = useCategoryStore();

  useEffect(() => {
    if (!category) return;

    // Mark this category as active in the sidebar
    setActive(category._id);

    // Auto-expand ancestor nodes so the user sees their position in the tree
    if (category.ancestors?.length) {
      expandAncestors(category.ancestors);
    }

    return () => {
      // Clean up active state when leaving category pages
      setActive(null);
    };
  }, [category?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Product grid (filtered by this category) ──────────────────────────────
  const {
    products, pagination,
    isLoading: productsLoading,
    isFetching: productsFetching,
    filters, setFilter, setPage, setSort, resetFilters,
    viewMode, setViewMode,
  } = useProducts();

  // Set categoryId filter when we know the category's _id
  // Clean up filter when leaving this page
  useEffect(() => {
    if (!category?._id) return;

    setFilter({ categoryId: category._id });

    return () => {
      // CRITICAL: reset category filter on unmount to prevent leaking
      // into ProductListingPage
      resetFilters();
    };
  }, [category?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sub-categories of the current category for the CategoryGrid section
  const subCategories = category?.children ?? [];

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!categoryLoading && isNotFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <CategoryEmpty variant="notfound" />
      </div>
    );
  }

  // ── Category API error ────────────────────────────────────────────────────
  if (!categoryLoading && categoryError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <CategoryEmpty
          variant="error"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* ── Category header (breadcrumb + name + description) ────────── */}
      <CategoryHeader
        category={category}
        breadcrumb={breadcrumb}
        isLoading={categoryLoading}
      />

      {/* ── Main body ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-7">

          {/* ── Desktop sidebar ────────────────────────────────────── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
              <CategorySidebar
                categories={allCategories}
                activeCategoryId={category?._id}
                isLoading={categoriesLoading}
              />
            </div>
          </aside>

          {/* ── Content column ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Sub-categories section */}
            {(categoryLoading || subCategories.length > 0) && (
              <section aria-label="Sub-categories">
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                  Browse Sub-categories
                </h2>
                <CategoryGrid
                  categories={subCategories}
                  isLoading={categoryLoading}
                />
              </section>
            )}

            {/* Products section */}
            <section aria-label={`Products in ${category?.name ?? "this category"}`}>
              {/* Sort bar + mobile sidebar toggle */}
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                  aria-expanded={sidebarOpen}
                  aria-controls="category-sidebar-drawer"
                >
                  <SlidersHorizontal size={15} aria-hidden="true" />
                  Categories
                </button>

                <div className="flex-1">
                  <ProductSort
                    totalCount={pagination.totalCount}
                    sortBy={filters.sortBy}
                    sortOrder={filters.sortOrder}
                    onSort={setSort}
                    viewMode={viewMode}
                    onViewMode={setViewMode}
                    isFetching={productsFetching && !productsLoading}
                  />
                </div>
              </div>

              {/* Product grid */}
              <div className="mt-5">
                <ProductGrid
                  products={products}
                  isLoading={productsLoading}
                  isFetching={productsFetching}
                  skeletonCount={filters.limit}
                  viewMode={viewMode}
                  onReset={resetFilters}
                  emptyVariant="category"
                />
              </div>

              {/* Pagination */}
              {!productsLoading && products.length > 0 && (
                <Pagination pagination={pagination} onPage={setPage} />
              )}
            </section>
          </div>
        </div>
      </div>

      {/* ── Mobile category sidebar drawer ──────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id="category-sidebar-drawer"
              role="dialog"
              aria-label="Category navigation"
              aria-modal="true"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-gray-950 z-50 shadow-2xl overflow-y-auto lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950 z-10">
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">
                  All Categories
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close category navigation"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer content */}
              <div className="p-3">
                <CategorySidebar
                  categories={allCategories}
                  activeCategoryId={category?._id}
                  isLoading={categoriesLoading}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}