/**
 * ============================================================================
 * src/components/admin/RecentActivity/RecentActivity.jsx
 * RecentActivity — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders the admin dashboard's recent-activity feed (new orders, payments,
 * signups, etc.) sourced from useRecentActivity() → GET /admin/activity.
 *
 * WHY NOT REUSE OrderStatusBadge:
 * Activity `type` (assumed: "order" | "payment" | "user" | "review" |
 * "system") is a DIFFERENT enum from Order status
 * (pending_payment|confirmed|processing|shipped|delivered|cancelled).
 * Importing OrderStatusBadge here would create a cross-feature dependency
 * in the wrong direction (admin dashboard reaching into the customer-facing
 * orders feature for a badge whose color/label logic is keyed to a
 * completely different set of values) — the exact same reasoning already
 * documented for OrderItems vs CheckoutItems (Architectural Convention #11).
 * Instead, this file owns a small LOCAL type→icon map, scoped to exactly
 * the values this feed can show.
 *
 * BACKEND CONTRACT (ASSUMED, via admin.service.js#getRecentActivity):
 *   activities: [{ _id, type, message, timestamp, actionUrl }]
 * `type` enum is NOT confirmed against the live backend — the icon map
 * below has a safe default (a generic "Activity" icon) for any unmapped
 * value, so an unexpected type never breaks rendering (Convention #10 —
 * conditional features degrade gracefully).
 *
 * INTERACTION:
 * Each row is a Link (if actionUrl present) or a plain row (if not) — same
 * "graceful degradation" principle as NotificationItem (Phase 16): the
 * feature never assumes actionUrl exists.
 *
 * PRODUCTION-READY BECAUSE:
 * - Local icon map isolates the activity-type contract from the unrelated
 *   order-status contract (no accidental coupling / no wrong-direction import)
 * - Handles loading (AdminSkeleton "activity" variant), error (inline retry),
 *   and empty (friendly empty state) — Convention #7
 * - Relative timestamps for scanability, exact time on hover via `title`
 */

import { Link } from "react-router-dom";
import {
  ShoppingBag,
  CreditCard,
  UserPlus,
  Star,
  Tag,
  Bell,
  AlertCircle,
} from "lucide-react";
import { AdminSkeleton } from "../AdminSkeleton/AdminSkeleton";

// Local, scoped map — NOT shared with OrderStatusBadge's enum (see file header).
const ACTIVITY_ICON_MAP = {
  order: { icon: ShoppingBag, accent: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
  payment: { icon: CreditCard, accent: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
  user: { icon: UserPlus, accent: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
  review: { icon: Star, accent: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  coupon: { icon: Tag, accent: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
  system: { icon: Bell, accent: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
};

const DEFAULT_ICON = { icon: Bell, accent: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" };

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
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const ActivityRow = ({ activity }) => {
  const { icon: Icon, accent } = ACTIVITY_ICON_MAP[activity.type] ?? DEFAULT_ICON;
  const timestampLabel = activity.timestamp
    ? new Date(activity.timestamp).toLocaleString("en-IN")
    : "Unknown time";

  const content = (
    <>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-800 dark:text-gray-200">
          {activity.message}
        </p>
        <p
          className="text-xs text-gray-400 dark:text-gray-500"
          title={timestampLabel}
        >
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </>
  );

  const rowClasses =
    "flex items-center gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700";

  // Graceful degradation: only render as a Link if actionUrl exists (Convention #10)
  if (activity.actionUrl) {
    return (
      <Link
        to={activity.actionUrl}
        className={`${rowClasses} -mx-2 rounded-lg px-2 transition hover:bg-gray-50 dark:hover:bg-gray-700/50`}
      >
        {content}
      </Link>
    );
  }

  return <div className={rowClasses}>{content}</div>;
};

export const RecentActivity = ({ activities, isLoading, isError, onRetry }) => {
  if (isLoading) {
    return <AdminSkeleton variant="activity" count={5} />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        <span className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Couldn't load recent activity.
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

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <Bell className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No recent activity yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {activities.map((activity) => (
        <ActivityRow key={activity._id} activity={activity} />
      ))}
    </div>
  );
};

export default RecentActivity;
