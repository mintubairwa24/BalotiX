/**
 * src/components/notifications/NotificationItem/NotificationItem.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Single notification row — the core interactive unit of this phase.
 * Handles two things on click:
 * 1. Navigate to `notification.actionUrl` if present (e.g. "/orders/:id")
 * 2. Fire mark-as-read as a "fire and forget" background mutation —
 *    NOT awaited before navigating, so clicking feels instant rather
 *    than waiting on a network round-trip first. If the mark-read call
 *    fails, the notification simply still shows as unread next fetch
 *    (see useMarkAsRead's onError comment) — a non-critical, retriable
 *    side effect, not a blocking gate on navigation.
 * 
 * DELETE — CONDITIONAL BY DESIGN:
 * Per this phase's instructions ("Delete notification only if backend
 * supports it"), the delete button is only rendered when an
 * `onDelete` callback is passed in by the parent. NotificationList
 * (this phase) decides whether to wire onDelete based on whether your
 * backend implements DELETE /notifications/:id — if not, simply don't
 * pass onDelete from NotificationList and the button never appears,
 * no other file needs to change.
 * 
 * VISUAL UNREAD INDICATOR:
 * Unread notifications get a subtle blue-tinted background and a dot
 * indicator — read notifications are visually de-emphasized (muted
 * text), the same "read vs unread" convention used by most inboxes.
 * 
 * Props:
 * - notification: { _id, title, message, type, isRead, actionUrl, createdAt }
 * - onDelete: callback(id)|undefined — presence controls delete button visibility
 * - onNavigate: callback() — called after navigation, e.g. to close the
 *   dropdown (NotificationDropdown passes closeDropdown here)
 */

import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, CreditCard, Tag, Bell } from "lucide-react";
import { useMarkAsRead } from "../../../hooks/useNotifications";

const TYPE_ICONS = {
  order: ShoppingBag,
  payment: CreditCard,
  promotion: Tag,
  system: Bell,
};

export const NotificationItem = ({ notification, onDelete, onNavigate }) => {
  const navigate = useNavigate();
  const { mutate: markAsRead } = useMarkAsRead();

  const Icon = TYPE_ICONS[notification.type] || Bell;

  const formatRelativeTime = (isoString) => {
    if (!isoString) return "";
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const handleClick = () => {
    // Fire-and-forget — don't block navigation on this resolving
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    onNavigate?.();
  };

  return (
    <div
      onClick={handleClick}
      className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        notification.isRead
          ? "hover:bg-gray-50 dark:hover:bg-gray-800"
          : "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          notification.isRead
            ? "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            : "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
        }`}
      >
        <Icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm ${
              notification.isRead
                ? "text-gray-700 dark:text-gray-300"
                : "font-semibold text-gray-900 dark:text-white"
            }`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Delete — only rendered if parent wired an onDelete handler,
          i.e. only if backend supports deletion (see header comment) */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id);
          }}
          className="self-start p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shrink-0"
          title="Remove notification"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};