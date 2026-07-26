/**
 * FILE: src/components/admin/analytics/RevenueCard/RevenueCard.jsx
 *
 * ============================================================================
 * RevenueCard — Phase 18H
 * ============================================================================
 *
 * WHY THIS IS A SEPARATE COMPONENT FROM DashboardCards (not a duplicate):
 * DashboardCards renders FOUR equal-weight metrics in a compact grid, for
 * the Analytics overview page. SalesReportPage's focus is specifically
 * revenue and sales performance — it needs ONE larger, more prominent
 * revenue figure as the page's headline number, not competing for
 * attention with orders/users/products counts. Reusing DashboardCards'
 * StatCard here would mean either showing three irrelevant metrics on a
 * sales-focused page, or awkwardly picking one card out of a four-card
 * grid component. A dedicated, larger card is the correct fit for this
 * page's actual layout need.
 *
 * DATA SOURCE:
 * Same useDashboardStats() hook DashboardCards uses — React Query dedupes
 * this into one shared request if both happen to be mounted, so this
 * isn't a second fetch for the same numbers.
 *
 * MONEY HANDLING (Convention #1): totalRevenue arrives in PAISE, formatted
 * only, never computed here.
 *
 * PRODUCTION-READY BECAUSE:
 * - Uses AnalyticsSkeleton("card") while loading, AnalyticsEmpty on error
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { IndianRupee, TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardStats } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const RevenueCard = () => {
  const { stats, isLoading, isError } = useDashboardStats();

  if (isLoading) return <AnalyticsSkeleton variant="card" />;
  if (isError) return <AnalyticsEmpty message="Couldn't load revenue summary." />;

  const change = stats?.revenueChangePercent;
  const isPositive = change >= 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center gap-2">
        <div className="rounded-lg bg-green-50 p-2 text-green-600 dark:bg-green-950 dark:text-green-400">
          <IndianRupee className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Revenue (selected period)
        </span>
      </div>
      <div className="mb-1 text-3xl font-bold text-gray-900 dark:text-gray-50">
        {formatPaise(stats?.totalRevenue)}
      </div>
      {change !== undefined && change !== null && (
        <span className={`inline-flex items-center gap-1 text-sm font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {Math.abs(change).toFixed(1)}% vs. previous period
        </span>
      )}
    </div>
  );
};

export default RevenueCard;