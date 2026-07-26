/**
 * FILE: src/components/admin/coupons/CouponsEmpty/CouponsEmpty.jsx
 *
 * ============================================================================
 * CouponsEmpty — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders when useAdminCouponsList() resolves with zero coupons. Exact
 * sibling of ProductsEmpty/CategoriesEmpty — same two-cause distinction:
 *   1. Active search/filters matched nothing → "no results" + "Clear filters"
 *   2. Genuinely zero coupons yet → "get started" + "Create Coupon" CTA
 *
 * REUSES:
 * `hasActiveFilters` is derived from the same adminCoupons.store.js fields
 * CouponSearch/CouponFilters already write to.
 *
 * PRODUCTION-READY BECAUSE:
 * - Dark mode via `dark:` classes (Convention #6)
 * - "Clear filters" calls the store's existing `resetFilters()`
 */

import { Link } from "react-router-dom";
import { TicketX, TicketPlus } from "lucide-react";
import { useAdminCouponsStore } from "../../../../store/adminCoupons.store";

export const CouponsEmpty = () => {
  const search = useAdminCouponsStore((s) => s.search);
  const status = useAdminCouponsStore((s) => s.status);
  const resetFilters = useAdminCouponsStore((s) => s.resetFilters);

  const hasActiveFilters = Boolean(search || status);

  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <TicketX className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No coupons match your search or filters.
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
      <TicketPlus className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        No coupons yet — create your first one to get started.
      </p>
      <Link
        to="/admin/coupons/create"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Create Coupon
      </Link>
    </div>
  );
};

export default CouponsEmpty;
