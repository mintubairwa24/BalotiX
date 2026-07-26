/**
 * FILE: src/components/admin/categories/CategoriesEmpty/CategoriesEmpty.jsx
 *
 * ============================================================================
 * CategoriesEmpty — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders when useAdminCategoriesList() resolves with zero categories.
 * Exact sibling of ProductsEmpty (Phase 18A) — same two-cause distinction:
 *   1. Active search/filters matched nothing → "no results" + "Clear filters"
 *   2. Genuinely zero categories yet → "get started" + "Add Category" CTA
 *
 * REUSES:
 * `hasActiveFilters` is derived from the same adminCategories.store.js
 * fields CategorySearch/CategoryFilters already write to.
 *
 * PRODUCTION-READY BECAUSE:
 * - Dark mode via `dark:` classes (Convention #6)
 * - "Clear filters" calls the store's existing `resetFilters()`
 */

import { Link } from "react-router-dom";
import { FolderSearch, FolderPlus } from "lucide-react";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";

export const CategoriesEmpty = () => {
  const search = useAdminCategoriesStore((s) => s.search);
  const status = useAdminCategoriesStore((s) => s.status);
  const parentFilter = useAdminCategoriesStore((s) => s.parentFilter);
  const resetFilters = useAdminCategoriesStore((s) => s.resetFilters);

  const hasActiveFilters = Boolean(search || status || parentFilter);

  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <FolderSearch className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No categories match your search or filters.
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
      <FolderPlus className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        No categories yet — add your first one to get started.
      </p>
      <Link
        to="/admin/categories/create"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Add Category
      </Link>
    </div>
  );
};

export default CategoriesEmpty;