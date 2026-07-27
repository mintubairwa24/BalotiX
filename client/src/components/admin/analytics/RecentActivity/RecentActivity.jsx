/**
 * FILE: src/components/admin/analytics/RecentActivity/RecentActivity.jsx
 *
 * ============================================================================
 * RecentActivity — Phase 18H
 * ============================================================================
 *
 * WHY THIS IS A SEPARATE FILE FROM Phase 17's RecentActivity (not the
 * same import reused verbatim): Phase 17's RecentActivity component was
 * built specifically for the Admin Dashboard overview page and imports
 * from that page's local component tree
 * (src/components/admin/RecentActivity). This phase's version lives in
 * the analytics feature folder and is visually adapted for this page's
 * layout (a sidebar/column widget rather than a full-width dashboard
 * section) — but it deliberately calls the EXACT SAME data source,
 * useRecentActivity() → admin.service.js#getRecentActivity (Phase 17,
 * completely unchanged this phase), rather than inventing a parallel
 * "analytics activity" concept. Same activity feed, second consumer.
 *
 * WHY THE TYPE→ICON MAP IS DUPLICATED HERE RATHER THAN IMPORTED FROM
 * PHASE 17's VERSION: Phase 17's RecentActivity lives under
 * src/components/admin/ (the Dashboard's own folder), not a shared
 * location — importing across feature folders for a small icon map would
 * create a cross-phase dependency for four lines of lookup logic. Small
 * enough to duplicate locally without meaningfully violating reuse
 * principles, consistent with how this project treats genuinely tiny,
 * self-contained pieces (see UserActivityTimeline, Phase 18C, making the
 * same call for its own small type→icon map).
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsSkeleton("list") while loading, AnalyticsEmpty on error/empty
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ShoppingBag, CreditCard, UserPlus, Star, Bell } from "lucide-react";
import { useRecentActivity } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const ACTIVITY_ICON_MAP = {
  order: { icon: ShoppingBag, classes: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  payment: { icon: CreditCard, classes: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
  user: { icon: UserPlus, classes: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  review: { icon: Star, classes: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
};
const DEFAULT_ICON = { icon: Bell, classes: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" };

const formatRelativeTime = (isoString) => {
  if (!isoString) return "";
  const diffMins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

export const RecentActivity = () => {
  const { activities, isLoading, isError } = useRecentActivity(8);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Activity</h2>

      {isLoading && <AnalyticsSkeleton variant="list" rows={6} />}
      {!isLoading && isError && <AnalyticsEmpty message="Couldn't load recent activity." />}
      {!isLoading && !isError && activities.length === 0 && (
        <AnalyticsEmpty message="No recent activity." />
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <ul className="space-y-3">
          {activities.map((activity) => {
            const { icon: Icon, classes } = ACTIVITY_ICON_MAP[activity.type] ?? DEFAULT_ICON;
            return (
              <li key={activity._id} className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${classes}`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-gray-800 dark:text-gray-200">{activity.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatRelativeTime(activity.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;