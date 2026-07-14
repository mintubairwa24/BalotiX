/**
 * src/components/notifications/NotificationDropdown/NotificationDropdown.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Header bell-icon dropdown, DELIBERATELY mirroring MiniCart's
 * (Phase 9) structure: compact preview (first 5 notifications),
 * "View All" link to the full page, empty state, and visibility
 * controlled by a Zustand store (notifications.store, same pattern as
 * cart.store's isMiniCartOpen).
 * 
 * REUSE:
 * - NotificationList (this phase, compact=true, small dataset)
 * - NotificationEmpty (this phase, compact=true)
 * - NotificationSkeleton (this phase)
 * - NotificationActions (this phase) — mark-all-as-read in the header row
 * - useNotificationsList(1, 5) (this phase) — same hook the full page
 *   uses, just a smaller page size
 * 
 * INTEGRATION (Header, Phase 3):
 * Same integration shape as MiniCart — a bell icon button toggles
 * `isDropdownOpen` via `toggleDropdown()`, and this component renders
 * itself positioned relative to that button. See
 * NOTIFICATIONS_Header_integration.md for the exact snippet.
 */

import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useNotificationsList } from "../../../hooks/useNotifications";
import { useNotificationsStore } from "../../../store/notifications.store";
import { NotificationList } from "../NotificationList/NotificationList";
import { NotificationEmpty } from "../NotificationEmpty/NotificationEmpty";
import { NotificationSkeleton } from "../NotificationSkeleton/NotificationSkeleton";
import { NotificationActions } from "../NotificationActions/NotificationActions";

export const NotificationDropdown = () => {
  const { isDropdownOpen, closeDropdown } = useNotificationsStore();

  // Same list hook the full page uses — just page=1, limit=5
  const { data, isLoading } = useNotificationsList(1, 5);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <AnimatePresence>
      {isDropdownOpen && (
        <>
          {/* Click-outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={closeDropdown} />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-112 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <NotificationActions unreadCount={unreadCount} />
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-2 flex-1">
              {isLoading && <NotificationSkeleton count={3} />}

              {!isLoading && notifications.length === 0 && (
                <NotificationEmpty compact />
              )}

              {!isLoading && notifications.length > 0 && (
                <NotificationList
                  notifications={notifications}
                  compact
                  onItemNavigate={closeDropdown}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-100 dark:border-gray-700">
              <Link
                to="/account/notifications"
                onClick={closeDropdown}
                className="block text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1.5"
              >
                View All Notifications
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};