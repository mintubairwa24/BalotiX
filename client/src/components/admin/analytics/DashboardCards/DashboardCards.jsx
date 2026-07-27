/**
 * FILE: src/components/admin/analytics/DashboardCards/DashboardCards.jsx
 *
 * ============================================================================
 * DashboardCards — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The top-of-page summary cards on AnalyticsDashboard — totalRevenue,
 * totalOrders, totalUsers, totalProducts, each with an optional period-
 * over-period change indicator. This is Phase 17's DashboardStats logic,
 * relocated and extended: Phase 17 built these cards for the Admin
 * Dashboard's overview with no date filtering; this phase's version is
 * date-range-aware (via the now-extended getDashboardStats) and lives on
 * the dedicated Analytics page instead. Rather than duplicate the same
 * card-rendering logic in two files, this component supersedes Phase 17's
 * DashboardStats for anywhere date-filtered totals are needed — Phase
 * 17's AdminDashboardPage can still use the original, un-filtered version
 * if left as-is, since that file wasn't touched this phase (only
 * additive changes were made to getDashboardStats — see
 * analytics.service.js's header on backward compatibility).
 *
 * MONEY HANDLING (Convention #1 — strict): `totalRevenue` arrives in
 * PAISE. Zero arithmetic here — only formatting, identical technique to
 * every other money display in this project.
 *
 * PRODUCTION-READY BECAUSE:
 * - Uses AnalyticsSkeleton("card") ×4 while loading, AnalyticsEmpty on error
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { IndianRupee, ShoppingBag, Users, Package, TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardStats } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatCount = (n) => (n ?? 0).toLocaleString("en-IN");

const ChangeIndicator = ({ value }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, change, accent }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className={`rounded-lg p-2 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
    <ChangeIndicator value={change} />
  </div>
);

export const DashboardCards = () => {
  const { stats, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <AnalyticsSkeleton key={i} variant="card" />)}
      </div>
    );
  }

  if (isError) return <AnalyticsEmpty message="Couldn't load dashboard summary." />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={IndianRupee} label="Total Revenue" value={formatPaise(stats?.totalRevenue)} change={stats?.revenueChangePercent} accent="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" />
      <StatCard icon={ShoppingBag} label="Total Orders" value={formatCount(stats?.totalOrders)} change={stats?.ordersChangePercent} accent="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" />
      <StatCard icon={Users} label="Total Users" value={formatCount(stats?.totalUsers)} change={stats?.usersChangePercent} accent="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" />
      <StatCard icon={Package} label="Total Products" value={formatCount(stats?.totalProducts)} change={stats?.productsChangePercent} accent="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" />
    </div>
  );
};

export default DashboardCards;