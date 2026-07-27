/**
 * FILE: src/components/admin/analytics/CustomerGrowthChart/CustomerGrowthChart.jsx
 *
 * ============================================================================
 * CustomerGrowthChart — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A new-signups-over-time chart, per "Customer analytics." Uses an area
 * chart rather than a plain line — cumulative growth trends read slightly
 * more naturally with a filled area, and it visually distinguishes this
 * chart from SalesChart's line chart at a glance when both are visible on
 * the same dashboard.
 *
 * BACKEND COMMUNICATION:
 * useCustomerGrowth() → analytics.service.js#getCustomerGrowth →
 * GET /analytics/customers/growth — a pre-aggregated { date,
 * newCustomers } series. No client-side counting of user records into
 * buckets; the backend already did that aggregation.
 *
 * WHY THIS IS SEPARATE FROM Phase 18C's User Management:
 * That module manages INDIVIDUAL user accounts (search, suspend, roles).
 * This chart is a pure aggregate trend — it has no per-user actions and
 * doesn't reuse UsersTable/UserRow, since the shape of what's needed here
 * (a count per day) is fundamentally different from a paginated list of
 * user records.
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsSkeleton("chart") while loading, AnalyticsEmpty on error/empty
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useCustomerGrowth } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const formatDateShort = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const CustomerGrowthChart = () => {
  const { series, isLoading, isError } = useCustomerGrowth();

  if (isLoading) return <AnalyticsSkeleton variant="chart" />;
  if (isError) return <AnalyticsEmpty message="Couldn't load customer growth data." />;
  if (series.length === 0) return <AnalyticsEmpty message="No new customers in this period." />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">New Customers</h2>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="customerGrowthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" width={30} allowDecimals={false} />
          <Tooltip labelFormatter={formatDateShort} />
          <Area type="monotone" dataKey="newCustomers" stroke="#4f46e5" strokeWidth={2} fill="url(#customerGrowthFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerGrowthChart;