/**
 * src/components/notifications/NotificationBadge/NotificationBadge.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Small numeric badge showing unread notification count, meant to sit
 * on top of a bell icon in the Header (Phase 3) — same visual
 * positioning pattern as the cart item-count badge introduced in
 * Phase 9's Header integration.
 * 
 * Purely presentational — takes `count` as a prop rather than fetching
 * its own data, so the SAME unread number (already fetched once by
 * whichever parent calls useNotificationsList, typically
 * NotificationDropdown) can be reflected here without a duplicate
 * network call.
 * 
 * Renders nothing when count is 0 — an empty/zero badge would be
 * visual noise sitting on the bell icon at all times.
 * 
 * Props:
 * - count: number
 */

export const NotificationBadge = ({ count = 0 }) => {
  if (!count || count <= 0) return null;

  const display = count > 99 ? "99+" : count;

  return (
    <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full leading-none">
      {display}
    </span>
  );
};