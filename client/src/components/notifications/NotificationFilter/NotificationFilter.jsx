/**
 * src/components/notifications/NotificationFilter/NotificationFilter.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Filter tabs (All / Unread / Read) for NotificationsPage. Per this
 * phase's instructions ("filtering only if backend supports it"), this
 * component is designed to work in TWO modes without any code branch
 * needed in the component itself:
 * 
 * 1. SERVER-SIDE FILTERING (preferred, if your backend accepts a
 *    `filter` query param — see notification.service.js): the parent
 *    passes `activeFilter` from notifications.store, and
 *    useNotificationsList(page, limit, activeFilter) refetches from
 *    the backend with that filter applied. This is what NotificationsPage
 *    does by default.
 * 
 * 2. CLIENT-SIDE FALLBACK (if your backend ignores/doesn't support the
 *    `filter` param): the already-fetched page's `notifications` array
 *    can simply be filtered in NotificationsPage before rendering
 *    (`notifications.filter(n => activeFilter === "unread" ? !n.isRead : ...)`)
 *    — this component's job (which tab is active, calling
 *    setActiveFilter) is identical either way; only NotificationsPage's
 *    handling of the returned list differs. See NotificationsPage
 *    comments for exactly where that fallback would go.
 * 
 * This component itself has ZERO backend awareness — pure controlled
 * tab UI, driven by notifications.store (this phase).
 * 
 * Props:
 * - activeFilter: "all" | "unread" | "read"
 * - onFilterChange: callback(filter)
 */

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

export const NotificationFilter = ({ activeFilter, onFilterChange }) => {
  return (
    <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
      {FILTERS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeFilter === key
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};