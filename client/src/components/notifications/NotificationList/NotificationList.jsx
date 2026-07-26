/**
 * src/components/notifications/NotificationList/NotificationList.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Container that maps NotificationItem (this phase) for a given array
 * of notifications. Used by BOTH NotificationDropdown (compact,
 * max 5 items) and NotificationsPage (full, paginated) — one list
 * renderer, two contexts, via the `compact` prop for spacing only.
 * 
 * DELETE WIRING — THE ONE PLACE THIS DECISION IS MADE:
 * This is the single component that decides whether NotificationItem's
 * delete button appears at all: it only passes `onDelete` down when
 * `enableDelete` is true. NotificationsPage/NotificationDropdown pass
 * `enableDelete={true}` ONLY if you've confirmed your backend
 * implements DELETE /notifications/:id (notification.service.js). This
 * keeps the "is delete supported" decision in exactly one place rather
 * than scattered across every call site.
 * 
 * Props:
 * - notifications: array
 * - compact: boolean - tighter spacing for dropdown context
 * - enableDelete: boolean - wire the delete button (default false)
 * - onItemNavigate: callback() - e.g. close dropdown after click
 */

import { NotificationItem } from "../NotificationItem/NotificationItem";
import { useDeleteNotification } from "../../../hooks/useNotifications";

export const NotificationList = ({
  notifications = [],
  compact = false,
  enableDelete = false,
  onItemNavigate,
}) => {
  const { mutate: deleteNotification } = useDeleteNotification();

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onDelete={enableDelete ? deleteNotification : undefined}
          onNavigate={onItemNavigate}
        />
      ))}
    </div>
  );
};