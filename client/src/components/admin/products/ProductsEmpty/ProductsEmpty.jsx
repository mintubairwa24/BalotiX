/**
 * FILE: src/components/admin/products/ProductsEmpty/ProductsEmpty.jsx
 *
 * ============================================================================
 * ProductsEmpty — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders when useAdminProductsList() resolves with zero products. Two
 * distinct causes need two distinct messages (Convention #7 — never fail
 * silently, never show a generic blank state):
 *   1. The admin has active search/filters that matched nothing → "no
 *      results" copy + a "Clear filters" action.
 *   2. There are genuinely zero products in the catalog yet (empty search,
 *      empty filters) → "get started" copy + an "Add Product" CTA straight
 *      to CreateProductPage.
 *
 * WHY THIS DISTINCTION MATTERS FOR AN ADMIN SCREEN SPECIFICALLY:
 * An admin staring at an empty table needs to know whether to loosen their
 * search or go create something — conflating the two into one generic
 * "No products found" message would leave a brand-new store's admin
 * confused about whether the catalog is broken or just empty.
 *
 * REUSES:
 * `hasActiveFilters` is derived from the same adminProducts.store.js fields
 * ProductSearch/ProductFilters already write to — no duplicate "is
 * filtered" state invented here.
 *
 * PRODUCTION-READY BECAUSE:
 * - Dark mode via `dark:` classes (Convention #6)
 * - "Clear filters" calls the store's existing `resetFilters()` — the same
 *   single source of truth every other filter control uses
 */

import { Link } from "react-router-dom";
import { PackageSearch, PackagePlus } from "lucide-react";
import { useAdminProductsStore } from "../../../../store/adminProducts.store";

const ProductsEmpty = () => {
  const search = useAdminProductsStore((s) => s.search);
  const category = useAdminProductsStore((s) => s.category);
  const status = useAdminProductsStore((s) => s.status);
  const resetFilters = useAdminProductsStore((s) => s.resetFilters);

  const hasActiveFilters = Boolean(search || category || status);

  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <PackageSearch className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No products match your search or filters.
        </p>
        <button
          onClick={resetFilters}
          className="text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <PackagePlus className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        No products yet — add your first one to get started.
      </p>
      <Link
        to="/admin/products/create"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Add Product
      </Link>
    </div>
  );
};

export default ProductsEmpty;