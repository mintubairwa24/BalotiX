/**
 * FILE: src/components/admin/users/UserStatistics/UserStatistics.jsx
 *
 * ============================================================================
 * UserStatistics — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Account-level stat cards for UserDetailsPage — member-since duration and
 * last login — reading fields directly off `user` (see UserOrdersSummary's
 * header for why order-related numbers live in a separate component
 * reading a separate part of the API response instead of here).
 *
 * WHY "Last Login" IS SHOWN WITH A FALLBACK, NOT HIDDEN:
 * `lastLoginAt` is a reasonable but unverified field on the assumed User
 * schema. Rather than omit the whole card if it's missing (which would
 * make the layout jump depending on data availability), it displays
 * "Never" / "—" gracefully — the same graceful-degradation principle
 * applied throughout this project rather than a component that only works
 * when every optional field happens to be present.
 *
 * PRODUCTION-READY BECAUSE:
 * - Account age computed from `createdAt` using only date arithmetic (not
 *   money — Convention #1 doesn't apply here, this isn't currency), so
 *   this is safe, ordinary display logic
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Clock, LogIn } from "lucide-react";

const getAccountAge = (createdAt) => {
  if (!createdAt) return "—";
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? "" : "s"}`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) === 1 ? "" : "s"}`;
};

const formatDateTime = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

const StatBlock = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

const UserStatistics = ({ user }) => {
  if (!user) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Account
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatBlock icon={Clock} label="Member For" value={getAccountAge(user.createdAt)} />
        <StatBlock icon={LogIn} label="Last Login" value={formatDateTime(user.lastLoginAt)} />
      </div>
    </div>
  );
};

export default UserStatistics;