/**
 * FILE: src/pages/admin/users/UsersPage.jsx
 *
 * ============================================================================
 * UsersPage — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/users route (rendered inside AdminLayout's <Outlet />,
 * Phase 17). Composes UserSearch + UserFilters in a toolbar row and
 * UsersTable, which itself mounts the four action modals. Exact sibling
 * of ProductsPage/CategoriesPage — except there is NO "Add User" button
 * (see UserEmpty's header: admins don't create customer accounts).
 *
 * AUTHORIZATION (Convention: reuse the existing auth system):
 * Same role-check pattern duplicated across every admin page since Phase
 * 17 (`user.role === "admin"` via useAuthStore). Now duplicated across
 * NINE admin pages (Dashboard + 3 Product + 3 Category + this + 2 more
 * Users pages) — the strongest signal yet that a shared <AdminRoute>
 * guard should be extracted, still flagged rather than done here since
 * it's routing infrastructure outside this phase's file list.
 *
 * PRODUCTION-READY BECAUSE:
 * - Toolbar (search + filters) wraps responsively on narrow admin viewports
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store";
import { UserSearch } from "../../../components/admin/users/UserSearch/UserSearch";
import { UserFilters } from "../../../components/admin/users/UserFilters/UserFilters";
import { UsersTable } from "../../../components/admin/users/UsersTable/UsersTable";

export const UsersPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      setBlocked(true);
      const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user, isAdmin, navigate]);

  if (isAuthLoading) return null;
  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting…
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
        Users
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <UserSearch />
        <UserFilters />
      </div>

      <UsersTable />
    </div>
  );
};

export default UsersPage;
