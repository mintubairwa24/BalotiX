/**
 * FILE: src/components/admin/products/ProductsPagination/ProductsPagination.jsx
 *
 * ============================================================================
 * ProductsPagination — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Prev/Next + "Showing X–Y of Z" controls for the admin product table,
 * driven entirely by the `pagination` object the BACKEND returns
 * (page/limit/totalPages/totalCount) — per the brief's instruction to
 * "reuse backend pagination" rather than recompute page counts client-side.
 * This component does zero arithmetic beyond display formatting (e.g.
 * `(page-1)*limit + 1` for the "Showing X–Y" label, which is pure display
 * math on already-known values, not business logic).
 *
 * WHY A DEDICATED COMPONENT (not importing a shared Pagination primitive):
 * This project may already have pagination UI elsewhere (order history,
 * catalog), but its exact export shape wasn't re-verified this session —
 * rather than guess at an unverified cross-feature import and risk a
 * broken build, this is a small, fully self-contained implementation using
 * only `pagination` + the store's `setPage`. If a shared Pagination
 * primitive does exist in your repo, swapping this file's internals to
 * delegate to it is a safe, isolated follow-up — nothing else in the
 * Products feature depends on HOW this component renders, only on it
 * calling `setPage`.
 *
 * PRODUCTION-READY BECAUSE:
 * - Prev/Next disable correctly at the first/last page using backend-
 *   provided `totalPages` — never lets the admin request an out-of-range page
 * - Renders nothing (not a broken control) when there's only one page
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminProductsStore } from "../../../../store/adminProducts.store";

const ProductsPagination = ({ pagination }) => {
  const setPage = useAdminProductsStore((s) => s.setPage);

  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, limit, totalPages, totalCount } = pagination;
  const rangeStart = (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, totalCount);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing {rangeStart}–{rangeEnd} of {totalCount} products
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

export default ProductsPagination;