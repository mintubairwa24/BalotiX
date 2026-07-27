/**
 * FILE: src/components/admin/analytics/OrdersChart/OrdersChart.jsx
 *
 * ============================================================================
 * OrdersChart — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * An order-volume bar chart plus a status breakdown, per "Order
 * analytics." Two views in one component: a bar chart of order COUNT
 * over time (`series`), and a small status-count list (`byStatus`) —
 * both come from the same useOrdersOverview() call, so this is one
 * network request rendering two visualizations rather than two separate
 * fetches.
 *
 * BACKEND COMMUNICATION:
 * useOrdersOverview() → admin.service.js#getAdminOrdersOverview →
 * GET /admin/orders/overview (flagged assumption — see admin.service.js's
 * header for why this lives there, not analytics.service.js).
 *
 * WHY STATUS LABELS/COLORS AREN'T INVENTED HERE:
 * `byStatus` entries are rendered with whatever `status` string the
 * backend sends, using a small local label/color map for common order
 * statuses (pending, shipped, delivered, cancelled) — consistent with
 * this project's established order-status enum from the customer-facing
 * checkout/order-history phases, not a new enum invented for this chart.
 * An unrecognized status still renders (with a neutral color), rather
 * than being silently dropped.
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsSkeleton("chart") while loading, AnalyticsEmpty on error/empty
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useOrdersOverview } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const formatDateShort = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const STATUS_COLORS = {
  pending_payment: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  confirmed: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  processing: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
  shipped: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  delivered: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  cancelled: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};
const DEFAULT_STATUS_COLOR = "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";

export const OrdersChart = () => {
  const { series, byStatus, isLoading, isError } = useOrdersOverview();

  if (isLoading) return <AnalyticsSkeleton variant="chart" />;
  if (isError) return <AnalyticsEmpty message="Couldn't load order data." />;
  if (series.length === 0 && byStatus.length === 0) {
    return <AnalyticsEmpty message="No orders in this period." />;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Orders Over Time</h2>

      {series.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" width={30} allowDecimals={false} />
            <Tooltip labelFormatter={formatDateShort} />
            <Bar dataKey="orderCount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {byStatus.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
          {byStatus.map((s) => (
            <span
              key={s.status}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[s.status] ?? DEFAULT_STATUS_COLOR}`}
            >
              {s.status}: {s.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersChart;