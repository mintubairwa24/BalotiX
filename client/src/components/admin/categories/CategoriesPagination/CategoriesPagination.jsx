/**
 * FILE: src/components/admin/categories/CategoriesPagination/CategoriesPagination.jsx
 *
 * ============================================================================
 * CategoriesPagination — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Prev/Next + "Showing X–Y of Z" controls for the admin category table,
 * exact sibling of ProductsPagination (Phase 18A) — driven entirely by the
 * `pagination` object the BACKEND returns (page/limit/totalPages/
 * totalCount). Zero client-side page-count math beyond pure display
 * formatting of already-known values.
 *
 * WHY A DEDICATED COMPONENT (not importing ProductsPagination directly):
 * Same self-containment reasoning as Phase 18A — rather than reach across
 * features for an unverified import, this is a small, fully self-contained
 * implementation using only `pagination` + the store's `setPage`. If a
 * shared Pagination primitive is later confirmed to exist in your repo,
 * both this file and ProductsPagination can be swapped to delegate to it
 * as an isolated follow-up.
 *
 * PRODUCTION-READY BECAUSE:
 * - Prev/Next disable correctly at the first/last page using backend-
 *   provided `totalPages`
 * - Renders nothing when there's only one page
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";

const CategoriesPagination = ({ pagination }) => {
  const setPage = useAdminCategoriesStore((s) => s.setPage);

  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, limit, totalPages, totalCount } = pagination;
  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {rangeStart}–{rangeEnd} of {totalCount} categories
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CategoriesPagination;