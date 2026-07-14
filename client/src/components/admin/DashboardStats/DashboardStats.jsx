/**
 * ============================================================================
 * src/components/admin/DashboardStats/DashboardStats.jsx
 * DashboardStats — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders the four headline admin metrics (revenue, orders, users, products)
 * as stat cards. Visually modeled on AccountStats (Phase 15) — same card
 * shape, spacing, and icon-left/number-right layout — but the DATA SOURCE
 * is entirely different (admin-wide analytics vs. one user's account), so
 * this is a sibling component, not a reuse-via-import of AccountStats.
 *
 * BACKEND CONTRACT (via useDashboardStats → GET /analytics/dashboard):
 *   { totalRevenue, totalOrders, totalUsers, totalProducts,
 *     revenueChangePercent?, ordersChangePercent?,
 *     usersChangePercent?, productsChangePercent? }
 *
 * MONEY HANDLING (Architectural Convention #1 — STRICT):
 * `totalRevenue` arrives in PAISE. This component does ZERO arithmetic on
 * it — only formatting: `₹${(paise/100).toLocaleString("en-IN", {...})}`.
 * The backend is the only place revenue is ever calculated.
 *
 * SCOPE — NO CHARTS:
 * These are static number cards only, per "DO NOT BUILD: Analytics charts."
 * The optional `*ChangePercent` fields render as a small up/down indicator,
 * NOT a sparkline or graph — if a future phase adds charts, that's a new
 * component, not a modification of this one.
 *
 * LOADING/EMPTY STATE:
 * DashboardStats does not fetch data itself — it receives `stats`,
 * `isLoading`, `isError` as props from DashboardOverview, which is the
 * single place composing useDashboardStats(). This keeps DashboardStats a
 * "dumb"/presentational component, easy to test and reuse.
 *
 * PRODUCTION-READY BECAUSE:
 * - No frontend money math (Convention #1)
 * - Dark mode via `dark:` classes (Convention #6)
 * - Renders AdminSkeleton("stats") while loading, and a clear inline error
 *   with retry when isError — never a blank/broken card (Convention #7)
 */

import { IndianRupee, ShoppingBag, Users, Package, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { AdminSkeleton } from "../AdminSkeleton/AdminSkeleton";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCount = (n) => (n ?? 0).toLocaleString("en-IN");

const ChangeIndicator = ({ value }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, change, accent }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className={`rounded-lg p-2 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-50">
      {value}
    </div>
    <ChangeIndicator value={change} />
  </div>
);

export const DashboardStats = ({ stats, isLoading, isError, onRetry }) => {
  if (isLoading) {
    return <AdminSkeleton variant="stats" />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        <span className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Couldn't load dashboard stats.
        </span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={IndianRupee}
        label="Total Revenue"
        value={formatPaise(stats?.totalRevenue)}
        change={stats?.revenueChangePercent}
        accent="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
      />
      <StatCard
        icon={ShoppingBag}
        label="Total Orders"
        value={formatCount(stats?.totalOrders)}
        change={stats?.ordersChangePercent}
        accent="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
      />
      <StatCard
        icon={Users}
        label="Total Users"
        value={formatCount(stats?.totalUsers)}
        change={stats?.usersChangePercent}
        accent="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
      />
      <StatCard
        icon={Package}
        label="Total Products"
        value={formatCount(stats?.totalProducts)}
        change={stats?.productsChangePercent}
        accent="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
      />
    </div>
  );
};

export default DashboardStats;