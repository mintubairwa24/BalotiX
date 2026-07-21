/**
 * FILE: src/components/admin/users/UserOrdersSummary/UserOrdersSummary.jsx
 *
 * ============================================================================
 * UserOrdersSummary — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Displays the order-related numbers for one user — total orders, total
 * spent, last order date — from `orderSummary` in useAdminUserDetail()'s
 * response. Per the brief, this phase implements "View order summary,"
 * NOT a full order history table — that's Order Management's territory
 * (a future admin phase), which this component deliberately does not
 * reach into or reimplement.
 *
 * WHY THIS IS SEPARATE FROM UserStatistics:
 * UserStatistics (this phase) covers ACCOUNT-level numbers (membership
 * duration, verification, login recency) — attributes of the user
 * themselves. UserOrdersSummary covers COMMERCE-level numbers — the
 * user's relationship to the Order module, a conceptually different
 * resource. Splitting them keeps each card's data source obvious (one
 * reads fields off `user`, the other reads `orderSummary`) rather than one
 * card mixing two different parts of the API response.
 *
 * MONEY HANDLING (Convention #1 — strict): `totalSpent` arrives in PAISE.
 * This component does zero arithmetic — only formatting, identical
 * technique to DashboardStats (Phase 17) and ProductRow (Phase 18A).
 *
 * PRODUCTION-READY BECAUSE:
 * - Renders an explicit "No orders yet" state when totalOrders is 0,
 *   rather than a confusing ₹0.00 with no context
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ShoppingBag, IndianRupee, Clock } from "lucide-react";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

const StatBlock = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

const UserOrdersSummary = ({ orderSummary }) => {
  const totalOrders = orderSummary?.totalOrders ?? 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Order Summary
      </h2>

      {totalOrders === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatBlock icon={ShoppingBag} label="Total Orders" value={totalOrders} />
          <StatBlock icon={IndianRupee} label="Total Spent" value={formatPaise(orderSummary?.totalSpent)} />
          <StatBlock icon={Clock} label="Last Order" value={formatDate(orderSummary?.lastOrderAt)} />
        </div>
      )}
    </div>
  );
};

export default UserOrdersSummary;