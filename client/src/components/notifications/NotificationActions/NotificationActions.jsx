/**
 * src/components/notifications/NotificationActions/NotificationActions.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Small action bar — currently just "Mark all as read" — extracted
 * into its own component (rather than inlined in both
 * NotificationDropdown and NotificationsPage) so the SAME button,
 * disabled/loading state, and behavior is reused in both places
 * without duplication. Only renders the button at all when there's at
 * least one unread notification, since "mark all as read" is
 * meaningless with zero unread.
 * 
 * Props:
 * - unreadCount: number
 */

import { CheckCheck } from "lucide-react";
import { useMarkAllAsRead } from "../../../hooks/useNotifications";

export const NotificationActions = ({ unreadCount = 0 }) => {
  const { mutate: markAllAsRead, isPending } = useMarkAllAsRead();

  if (unreadCount <= 0) return null;

  return (
    <button
      onClick={() => markAllAsRead()}
      disabled={isPending}
      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <CheckCheck size={14} />
      {isPending ? "Marking..." : "Mark all as read"}
    </button>
  );
};