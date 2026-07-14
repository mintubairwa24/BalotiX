/**
 * src/components/notifications/NotificationEmpty/NotificationEmpty.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Empty state shown when there are no notifications to display — same
 * pattern as OrderEmpty (Phase 14), AddressEmpty (Phase 11). Supports a
 * `compact` variant for the dropdown context (smaller, no big icon)
 * versus the full page context.
 * 
 * Props:
 * - compact: boolean - smaller layout for NotificationDropdown (default false)
 * - filtered: boolean - true if empty because of an active filter
 *   (shows different copy than "genuinely no notifications")
 */

import { Bell, BellOff } from "lucide-react";

export const NotificationEmpty = ({ compact = false, filtered = false }) => {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <BellOff size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No notifications yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
        <Bell size={40} className="text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {filtered ? "No matching notifications" : "You're all caught up"}
      </h3>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-sm">
        {filtered
          ? "Try a different filter to see more notifications."
          : "New notifications about your orders and account will appear here."}
      </p>
    </div>
  );
};