/**
 * FILE: src/components/admin/inventory/InventoryPagination/InventoryPagination.jsx
 *
 * ============================================================================
 * InventoryPagination — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Prev/Next + "Showing X–Y of Z" controls for the admin inventory table,
 * exact sibling of CouponsPagination/ProductsPagination — driven entirely
 * by the `pagination` object the BACKEND returns. Zero client-side
 * page-count math beyond pure display formatting.
 *
 * PRODUCTION-READY BECAUSE:
 * - Prev/Next disable correctly at the first/last page
 * - Renders nothing when there's only one page
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminInventoryStore } from "../../../../store/adminInventory.store";

export const InventoryPagination = ({ pagination }) => {
  const setPage = useAdminInventoryStore((s) => s.setPage);

  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, limit, totalPages, totalCount } = pagination;
  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {rangeStart}–{rangeEnd} of {totalCount} items
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

export default InventoryPagination;