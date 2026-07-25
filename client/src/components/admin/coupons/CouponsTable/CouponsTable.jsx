/**
 * FILE: src/components/admin/coupons/CouponsTable/CouponsTable.jsx
 *
 * ============================================================================
 * CouponsTable — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the coupon list — column headers (with
 * click-to-sort), CouponRow's, loading/error/empty states, pagination, and
 * DeleteCouponModal. Exact sibling of ProductsTable/CategoriesTable.
 *
 * WHY DeleteCouponModal IS MOUNTED HERE, NOT AT THE PAGE LEVEL:
 * Same reasoning as DeleteCategoryModal (Phase 18B) — it needs the full
 * coupon record (code, usageCount) for its confirmation copy, and this
 * table already holds the fetched `coupons` array from
 * useAdminCouponsList(), so mounting the modal here avoids prop-drilling
 * the list up to CouponsPage and back down.
 *
 * SORTING — REUSES BACKEND SORT:
 * Clicking a sortable header calls `setSort(field, nextOrder)` on
 * adminCoupons.store.js, included in useAdminCouponsList()'s queryKey and
 * GET /admin/coupons params. The backend does the actual sorting.
 *
 * PRODUCTION-READY BECAUSE:
 * - Loading state renders CouponsSkeleton inside the same <table> markup
 *   so headers stay visible during page/filter changes
 * - Error state gives an explicit retry rather than a silent empty table
 * - Empty state only renders once loading is confirmed finished AND zero
 *   rows returned
 */

import { ArrowUpDown, AlertCircle } from "lucide-react";
import { useAdminCouponsList } from "../../../../hooks/useAdminCoupons";
import { useAdminCouponsStore } from "../../../../store/adminCoupons.store";
import { CouponRow } from "../CouponRow/CouponRow";
import { CouponsSkeleton } from "../CouponsSkeleton/CouponsSkeleton";
import { CouponsEmpty } from "../CouponsEmpty/CouponsEmpty";
import { CouponsPagination } from "../CouponsPagination/CouponsPagination";
import { DeleteCouponModal } from "../DeleteCouponModal/DeleteCouponModal";

const COLUMNS = [
  { key: "code", label: "Code", sortable: true },
  { key: "discountValue", label: "Discount", sortable: true },
  { key: "expiryDate", label: "Expires", sortable: true },
  { key: "usageCount", label: "Usage", sortable: false },
  { key: "isActive", label: "Status", sortable: false },
  { key: "actions", label: "", sortable: false },
];

// ARCHITECTURAL FIX: To resolve the cascade of import/export errors, all components
// are being standardized to use NAMED EXPORTS. This component was previously using a
// default export. This change makes it a named export, consistent with the rest of
// the application. Any file that imports this component must now use `import { CouponsTable } from ...`.
export const CouponsTable = () => {
  const { coupons, pagination, isLoading, isError, error, refetch } =
    useAdminCouponsList();

  const sortBy = useAdminCouponsStore((s) => s.sortBy);
  const sortOrder = useAdminCouponsStore((s) => s.sortOrder);
  const setSort = useAdminCouponsStore((s) => s.setSort);

  const handleSortClick = (key) => {
    const nextOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSort(key, nextOrder);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSortClick(col.key)}
                      className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {col.label}
                      <ArrowUpDown
                        className={`h-3 w-3 ${
                          sortBy === col.key ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <CouponsSkeleton rows={pagination?.limit ?? 5} />}

            {!isLoading &&
              !isError &&
              coupons.map((coupon) => <CouponRow key={coupon._id} coupon={coupon} />)}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="flex items-center justify-between p-6 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error?.message ?? "Couldn't load coupons."}
          </span>
          <button
            onClick={refetch}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && coupons.length === 0 && <CouponsEmpty />}

      {!isLoading && !isError && coupons.length > 0 && (
        <div className="p-4">
          <CouponsPagination pagination={pagination} />
        </div>
      )}

      <DeleteCouponModal coupons={coupons} />
    </div>
  );
};