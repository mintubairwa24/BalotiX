/**
 * src/components/layout/Header/NotificationIcon.jsx
 *
 * PURPOSE:
 *   Bell icon with unread count badge. Reads unreadCount from
 *   notification.store.js. Only shown when authenticated.
 *
 * FUTURE:
 *   On mount (authenticated): GET /notifications → setUnreadCount(data.unreadCount).
 *   After marking all read: setUnreadCount(0).
 */

import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "../../../store/notification.store";

export function NotificationIcon() {
  const { unreadCount } = useNotificationStore();

  return (
    <Link
      to="/account/notifications"
      className="relative w-9 h-9 rounded-xl flex items-center justify-center theme-text-muted hover:text-[var(--app-fg)] hover:bg-[var(--app-surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ""}`}
    >
      <Bell size={20} />

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
