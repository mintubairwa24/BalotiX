/**
 * FILE: src/components/admin/users/UserActivityTimeline/UserActivityTimeline.jsx
 *
 * ============================================================================
 * UserActivityTimeline — Phase 18C
 * ============================================================================
 *
 * WHY THIS IS THE MOST SPECULATIVE COMPONENT IN THIS PHASE (flagged
 * explicitly, not quietly assumed): admin.service.js's getAdminUserById
 * contract assumes an `activity` array in the response — but unlike
 * addresses and order summaries (which clearly exist elsewhere in this
 * project's completed modules), a dedicated "user activity feed" backing
 * store was never confirmed to exist anywhere in prior phases. This is
 * built because the brief's feature list doesn't explicitly ask for it as
 * a standalone item (registration/status history isn't named), but the
 * detail contract in admin.service.js includes it for symmetry with
 * Phase 17's RecentActivity feed. GRACEFUL DEGRADATION IS THE POINT HERE:
 * if `activity` comes back empty or undefined, this component renders a
 * plain "No recorded activity" state rather than an error — so if the
 * backend genuinely has no such endpoint, the UI degrades to something
 * harmless instead of breaking UserDetails.
 *
 * WHY NOT REUSE Phase 17's RecentActivity DIRECTLY:
 * That component is scoped to STORE-WIDE admin activity (new orders,
 * payments, signups across ALL users) with its own type→icon map keyed to
 * that scope. This component is scoped to ONE user's history — a
 * different, narrower domain even if the visual shape (icon + message +
 * timestamp) looks similar. Same "shared visual language, separate file
 * because the underlying data scope differs" reasoning used throughout
 * this project (ProductsSkeleton vs. AdminSkeleton, etc.).
 *
 * PRODUCTION-READY BECAUSE:
 * - Never renders broken UI for missing/empty activity — explicit empty
 *   state instead
 * - Relative timestamps for scanability (same formatter approach as
 *   RecentActivity, Phase 17)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Clock } from "lucide-react";

const formatRelativeTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const UserActivityTimeline = ({ activity = [] }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Activity
      </h2>

      {activity.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No recorded activity.
        </p>
      ) : (
        <ol className="space-y-3">
          {activity.map((item) => (
            <li key={item._id} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                <Clock className="h-3 w-3" />
              </div>
              <div>
                <p className="text-sm text-gray-800 dark:text-gray-200">{item.message}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatRelativeTime(item.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default UserActivityTimeline;