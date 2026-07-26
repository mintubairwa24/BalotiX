/**
 * FILE: src/components/admin/analytics/SalesChart/SalesChart.jsx
 *
 * ============================================================================
 * SalesChart — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A revenue-over-time line chart, per the brief's "Sales analytics" and
 * "CHARTS: use the existing chart library; if none exists, install
 * Recharts" instruction. No chart library existed anywhere in this
 * project before this phase — **`npm install recharts` is required**
 * before this file will compile in your real repo.
 *
 * BACKEND COMMUNICATION:
 * useSalesAnalytics() → analytics.service.js#getSalesAnalytics →
 * GET /analytics/sales — returns a pre-aggregated time series (one point
 * per day/period, already summed by the backend). This component does
 * NOT aggregate raw order records into a time series itself — that
 * aggregation is exactly the kind of computation the backend should own
 * (consistent with "do not invent calculations"), this chart only plots
 * whatever series it's given.
 *
 * MONEY HANDLING (Convention #1): each point's `revenue` value arrives in
 * PAISE. The Y-axis and tooltip both format via ₹ conversion — the chart
 * library itself never receives pre-divided rupee values that would
 * silently reintroduce frontend money math; formatting happens only in
 * the tick/tooltip formatter functions, at render time, for display only.
 *
 * PRODUCTION-READY BECAUSE:
 * - ResponsiveContainer makes the chart adapt to any card width
 * - AnalyticsSkeleton("chart") while loading, AnalyticsEmpty on error/empty
 * - Colors kept close to this project's indigo accent for visual
 *   consistency with the rest of the admin
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useSalesAnalytics } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const formatPaiseShort = (paise) => `₹${((paise ?? 0) / 100).toLocaleString("en-IN")}`;

const formatDateShort = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <p className="mb-1 font-medium text-gray-700 dark:text-gray-200">{formatDateShort(label)}</p>
      <p className="text-gray-600 dark:text-gray-300">Revenue: {formatPaiseShort(payload[0].value)}</p>
    </div>
  );
};

const SalesChart = () => {
  const { series, isLoading, isError } = useSalesAnalytics();

  if (isLoading) return <AnalyticsSkeleton variant="chart" />;
  if (isError) return <AnalyticsEmpty message="Couldn't load sales data." />;
  if (series.length === 0) return <AnalyticsEmpty message="No sales in this period." />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Revenue Over Time</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tickFormatter={formatPaiseShort} tick={{ fontSize: 12 }} stroke="#9ca3af" width={70} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;