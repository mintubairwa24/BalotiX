/**
 * src/components/notifications/NotificationSkeleton/NotificationSkeleton.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Loading skeleton for notification rows, used in both
 * NotificationDropdown (compact) and NotificationsPage (full list) —
 * same layout-shift-prevention principle as OrderSkeleton (Phase 14),
 * AccountSkeleton (Phase 15), etc.
 * 
 * Props:
 * - count: number of skeleton rows (default 3)
 */

export const NotificationSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};