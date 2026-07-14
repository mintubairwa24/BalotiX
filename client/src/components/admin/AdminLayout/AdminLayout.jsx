/**
 * ============================================================================
 * src/components/admin/AdminLayout/AdminLayout.jsx
 * AdminLayout — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The structural shell for every admin route: AdminSidebar on the left,
 * AdminHeader on top, and a content area rendering whatever nested route
 * matches via <Outlet />. This is the admin equivalent of the customer-
 * facing CustomerLayout (Phase 3) — same "layout wraps Outlet" pattern
 * used throughout React Router setups in this project — but intentionally
 * a SEPARATE component, not a themed variant of CustomerLayout, because
 * the two shells share almost no visual or navigational structure (no
 * mega-menu, no search bar, no cart icon, no footer — admin is a sidebar
 * app, customer is a top-nav storefront).
 *
 * WHY <Outlet /> HERE INSTEAD OF PASSING children:
 * Consistent with CustomerLayout — this lets AppRoutes.jsx nest all
 * current and future /admin/* pages under ONE <Route element={<AdminLayout />}>
 * wrapper, so Phase 18+ CRUD pages automatically get the sidebar/header
 * shell for free without touching this file again.
 *
 * RESPONSIVE COORDINATION:
 * AdminSidebar and AdminHeader don't talk to each other directly — both
 * read/write adminDashboard.store.js (Zustand), so this layout component
 * itself stays "dumb": it just arranges the two in a flex row/column and
 * lets the store be the single coordination point (no prop drilling of
 * toggle state through AdminLayout).
 *
 * PRODUCTION-READY BECAUSE:
 * - Full-height flex layout (`min-h-screen`) so short-content admin pages
 *   don't leave a broken/short sidebar
 * - Dark mode background via `dark:` classes (Convention #6)
 * - `<main>` has its own scroll context (`overflow-y-auto`) so the sidebar
 *   stays fixed in place while dashboard content scrolls — standard admin
 *   dashboard UX
 */

import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../AdminSidebar/AdminSidebar";
import { AdminHeader } from "../AdminHeader/AdminHeader"; 

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;