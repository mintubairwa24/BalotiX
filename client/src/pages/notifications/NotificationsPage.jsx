/**
 * src/pages/notifications/NotificationsPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Full Notification Center at route /notifications. Same structural
 * pattern as OrdersPage (Phase 14): loading/error/empty routing +
 * delegates the populated state to list/pagination components, plus
 * this phase's filter tabs.
 * 
 * FILTER HANDLING (see NotificationFilter's header comment for the
 * two supported modes):
 * This page passes `activeFilter` straight into useNotificationsList's
 * `filter` param, i.e. SERVER-SIDE filtering by default. If your
 * backend does NOT support the `filter` query param, uncomment the
 * client-side fallback line below (`displayedNotifications`) to filter
 * the fetched page in the browser instead — no other file changes
 * needed either way.
 * 
 * DELETE — CONDITIONAL:
 * `enableDelete` is set to `false` by default below. Flip to `true`
 * ONLY after confirming your backend implements DELETE
 * /notifications/:id (see notification.service.js comments).
 * 
 * BACKEND INTEGRATION:
 * - GET /notifications?page=&limit=&filter= (useNotificationsList)
 * - PATCH /notifications/mark-all-read (via NotificationActions)
 * - PATCH /notifications/:id/read (via NotificationItem, on click)
 * - DELETE /notifications/:id (via NotificationList, if enableDelete)
 * 
 * REUSE:
 * - NotificationFilter, NotificationList, NotificationActions,
 *   NotificationEmpty, NotificationSkeleton (all this phase)
 */

import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useNotificationsList } from "../../hooks/useNotifications";
import { useNotificationsStore } from "../../store/notifications.store";
import {
  NotificationFilter,
  NotificationList,
  NotificationActions,
  NotificationEmpty,
  NotificationSkeleton,
} from "../../components/notifications";

const PAGE_SIZE = 15;

// Delete is supported by the backend, so expose it in the full notification center.
const ENABLE_DELETE = true;

export const NotificationsPage = () => {
  const { activeFilter, setActiveFilter, currentPage, setCurrentPage } =
    useNotificationsStore();

  const { data, isLoading, isError, error } = useNotificationsList(
    currentPage,
    PAGE_SIZE,
    activeFilter
  );

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  // CLIENT-SIDE FALLBACK (uncomment if backend ignores the `filter` param):
  // const displayedNotifications =
  //   activeFilter === "all"
  //     ? notifications
  //     : notifications.filter((n) =>
  //         activeFilter === "unread" ? !n.isRead : n.isRead
  //       );
  const displayedNotifications = notifications;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
          </div>
          <NotificationActions unreadCount={unreadCount} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 pt-2">
            <NotificationFilter
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          <div className="p-4">
            {isLoading && <NotificationSkeleton count={5} />}

            {isError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Failed to load notifications
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    {error?.message || "Something went wrong"}
                  </p>
                </div>
              </div>
            )}

            {!isLoading && !isError && displayedNotifications.length === 0 && (
              <NotificationEmpty filtered={activeFilter !== "all"} />
            )}

            {!isLoading && !isError && displayedNotifications.length > 0 && (
              <NotificationList
                notifications={displayedNotifications}
                enableDelete={ENABLE_DELETE}
              />
            )}
          </div>

          {/* Pagination — same pattern as OrdersList (Phase 14) */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-4">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};