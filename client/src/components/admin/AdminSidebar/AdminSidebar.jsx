/**
 * ============================================================================
 * src/components/admin/AdminSidebar/AdminSidebar.jsx
 * AdminSidebar — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The admin shell's primary navigation. Shows the FULL future information
 * architecture (Dashboard, Products, Orders, Users, Coupons, Categories)
 * so admins immediately understand the app's shape — but only "Dashboard"
 * is a real, clickable NavLink today. This mirrors QuickActions' reasoning
 * exactly: routes for CRUD sections don't exist yet (future phases), so
 * they're rendered disabled with a "Soon" badge rather than as dead links.
 *
 * RESPONSIVE BEHAVIOR (reads adminDashboard.store.js — UI state only):
 * - Desktop (lg+): a persistent left rail. `isSidebarCollapsed` toggles
 *   between full width (icon + label) and icon-only rail.
 * - Mobile (< lg): an off-canvas drawer. `isMobileSidebarOpen` controls
 *   visibility; a backdrop click or nav-item click closes it (same
 *   backdrop-click-outside pattern as MiniCart/NotificationDropdown).
 *
 * REUSES:
 * React Router's <NavLink> for automatic active-state styling — same
 * primitive already used in the customer-facing Header (Phase 3) nav.
 *
 * PRODUCTION-READY BECAUSE:
 * - Disabled items are real <button disabled>, not styled <div>s — screen
 *   readers correctly announce them as unavailable (same approach as
 *   QuickActions)
 * - Collapsed state hides labels but keeps icons + tooltips (via `title`),
 *   so navigation remains usable when collapsed
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  FolderTree,
  X,
} from "lucide-react";
import { useAdminDashboardStore } from "../../../store";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/admin", enabled: true },
  { key: "products", label: "Products", icon: Package, to: "/admin/products", enabled: false },
  { key: "orders", label: "Orders", icon: ShoppingCart, to: "/admin/orders", enabled: false },
  { key: "users", label: "Users", icon: Users, to: "/admin/users", enabled: false },
  { key: "coupons", label: "Coupons", icon: Tag, to: "/admin/coupons", enabled: false },
  { key: "categories", label: "Categories", icon: FolderTree, to: "/admin/categories", enabled: false },
];

const NavItem = ({ item, collapsed, onNavigate }) => {
  const { icon: Icon, label, to, enabled } = item;

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={collapsed ? `${label} — coming soon` : undefined}
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 dark:text-gray-600"
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{label}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              Soon
            </span>
          </>
        )}
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        }`
      }
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export const AdminSidebar = () => {
  const isSidebarCollapsed = useAdminDashboardStore((s) => s.isSidebarCollapsed);
  const isMobileSidebarOpen = useAdminDashboardStore((s) => s.isMobileSidebarOpen);
  const closeMobileSidebar = useAdminDashboardStore((s) => s.closeMobileSidebar);

  const navList = (collapsed, onNavigate) => (
    <nav className="space-y-1 p-3">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.key} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop persistent rail */}
      <aside
        className={`hidden shrink-0 border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-700 dark:bg-gray-800 lg:block ${
          isSidebarCollapsed ? "w-18" : "w-64"
        }`}
      >
        {navList(isSidebarCollapsed, undefined)}
      </aside>

      {/* Mobile off-canvas drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop — click-outside closes, same pattern as MiniCart/NotificationDropdown */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-3 dark:border-gray-700">
              <span className="px-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                Admin Menu
              </span>
              <button
                onClick={closeMobileSidebar}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navList(false, closeMobileSidebar)}
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;