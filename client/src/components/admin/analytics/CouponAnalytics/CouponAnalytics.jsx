/**
 * FILE: src/components/admin/analytics/CouponAnalytics/CouponAnalytics.jsx
 *
 * ============================================================================
 * CouponAnalytics — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A "which coupons are actually being used" widget, per "Coupon
 * analytics." Like InventoryInsights, this REUSES an existing endpoint
 * rather than inventing a new one — Phase 18E's getAdminCoupons already
 * returns each coupon's `usageCount`; useCouponPerformance() (in
 * useAnalytics.js) fetches that same list and sorts it by usage
 * client-side. Sorting an already-fetched list for DISPLAY order is
 * ordinary presentation logic, not a business computation — the actual
 * usageCount itself is entirely backend-tracked, never computed here.
 *
 * WHY NOT JUST REUSE Phase 18E's CouponUsage COMPONENT DIRECTLY:
 * CouponUsage (Phase 18E) renders one coupon's progress-bar-against-limit
 * for a table row. This widget needs a ranked TOP-N list across multiple
 * coupons, a different composition than a single row's usage bar — so it
 * builds its own compact list here while still relying on the exact same
 * `usageCount`/`usageLimit` fields Phase 18E's CouponUsage reads, keeping
 * the underlying data model consistent even though the visual shape differs.
 *
 * PRODUCTION-READY BECAUSE:
 * - Links each coupon to its Phase 18E edit page
 * - AnalyticsSkeleton("list") while loading, AnalyticsEmpty on error/empty
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import { useCouponPerformance } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

export const CouponAnalytics = () => {
  const { topCoupons, isLoading, isError } = useCouponPerformance(5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Top Coupons by Usage</h2>

      {isLoading && <AnalyticsSkeleton variant="list" rows={5} />}
      {!isLoading && isError && <AnalyticsEmpty message="Couldn't load coupon performance." />}
      {!isLoading && !isError && topCoupons.length === 0 && (
        <AnalyticsEmpty message="No coupons have been used yet." />
      )}

      {!isLoading && !isError && topCoupons.length > 0 && (
        <ol className="space-y-3">
          {topCoupons.map((coupon, i) => (
            <li key={coupon._id} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">
                {i + 1}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400">
                <Ticket className="h-4 w-4" />
              </div>
              <Link
                to={`/admin/coupons/${coupon._id}/edit`}
                className="min-w-0 flex-1 truncate font-mono text-sm text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              >
                {coupon.code}
              </Link>
              <span className="shrink-0 text-sm font-medium text-gray-900 dark:text-gray-100">
                {coupon.usageCount ?? 0} used
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default CouponAnalytics;