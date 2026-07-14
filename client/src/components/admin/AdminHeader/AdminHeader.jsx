/**
 * ============================================================================
 * src/components/admin/AdminHeader/AdminHeader.jsx
 * AdminHeader — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The admin shell's top bar: mobile sidebar toggle, desktop sidebar
 * collapse toggle, and the notification bell. Sits above <Outlet /> in
 * AdminLayout, alongside AdminSidebar.
 *
 * REUSES (Architectural Convention #11):
 * - `NotificationDropdown` + `NotificationBadge` (Phase 16) — imported
 *   DIRECTLY, no admin-specific wrapper. Admins receive notifications
 *   through the exact same /notifications backend module as customers
 *   (order, payment, promotion, system types), so there is no reason to
 *   duplicate the dropdown's backdrop/click-outside/preview-list logic or
 *   the badge's count-formatting logic. This is the same "identical data
 *   source ⇒ reuse directly" reasoning as AdminWelcome reusing useProfile().
 *
 * WHY NOT REUSE THE CUSTOMER-FACING Header.jsx WHOLESALE:
 * The customer Header (Phase 3) also renders search, cart, category nav —
 * none of which belong in the admin shell. Rather than conditionally
 * hiding half of Header's contents with admin-only branches (which would
 * couple two very different navigation contexts into one file), AdminHeader
 * is a small sibling component that reuses only the specific pieces that
 * are genuinely shared (NotificationDropdown/Badge), consistent with the
 * project's documented reuse-with-exceptions pattern.
 *
 * RESPONSIVE:
 * - Mobile (< lg): hamburger button opens the AdminSidebar drawer via
 *   adminDashboard.store.js's openMobileSidebar().
 * - Desktop (lg+): a collapse-rail toggle instead of a hamburger, via
 *   toggleSidebarCollapsed().
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero duplicated notification logic — one dropdown implementation for
 *   the entire app (customer + admin)
 * - Dark mode via `dark:` classes (Convention #6)
 * - Sticky positioning so the bell/menu stay reachable while scrolling a
 *   long dashboard
 *
 * INTEGRATION ASSUMPTION (flagged, not verified — Phase 16 wasn't
 * re-inspected this session): NotificationDropdown is assumed to accept a
 * `trigger` prop for the element that opens it (here, NotificationBadge),
 * mirroring how it's presumably wired into the customer Header.jsx. If the
 * real Phase 16 API differs (e.g. NotificationDropdown renders its own
 * badge internally with no `trigger` prop), only this file's JSX changes —
 * swap the line below for however Header.jsx actually composes them.
 */

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAdminDashboardStore } from "../../../store/adminDashboard.store";
import { NotificationDropdown } from "../../notifications/NotificationDropdown/NotificationDropdown";
import { NotificationBadge } from "../../notifications/NotificationBadge/NotificationBadge";

export const AdminHeader = () => {
  const isSidebarCollapsed = useAdminDashboardStore((s) => s.isSidebarCollapsed);
  const toggleSidebarCollapsed = useAdminDashboardStore((s) => s.toggleSidebarCollapsed);
  const openMobileSidebar = useAdminDashboardStore((s) => s.openMobileSidebar);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        {/* Mobile: opens off-canvas AdminSidebar drawer */}
        <button
          onClick={openMobileSidebar}
          aria-label="Open menu"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop: collapses the persistent rail */}
        <button
          onClick={toggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 lg:block"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>

        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Admin
        </span>
      </div>

      {/* Directly reused from Phase 16 — same notification system as customers */}
      <div className="flex items-center gap-3">
        <NotificationDropdown trigger={<NotificationBadge />} />
      </div>
    </header>
  );
};

export default AdminHeader;