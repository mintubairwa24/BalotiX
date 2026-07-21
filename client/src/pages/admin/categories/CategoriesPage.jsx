/**
 * FILE: src/pages/admin/categories/CategoriesPage.jsx
 *
 * ============================================================================
 * CategoriesPage — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/categories route (rendered inside AdminLayout's <Outlet />,
 * Phase 17). Composes CategorySearch + CategoryFilters in a toolbar row
 * and CategoriesTable, which itself mounts DeleteCategoryModal (see
 * CategoriesTable's header for why the modal lives there instead of here).
 * Exact sibling of ProductsPage (Phase 18A).
 *
 * AUTHORIZATION (Convention: reuse the existing auth system):
 * Uses the SAME role-check pattern established in Phase 17's
 * AdminDashboardPage and duplicated across Phase 18A's product pages
 * (`user.role === "admin"` via useAuthStore). This is now duplicated
 * across seven admin pages total — the trigger for extracting a shared
 * <AdminRoute> guard keeps getting stronger, but that extraction still
 * touches routing infrastructure rather than the Categories feature files
 * this phase is scoped to, so it remains a flagged, isolated follow-up
 * rather than done here.
 *
 * PRODUCTION-READY BECAUSE:
 * - "Add Category" CTA is always reachable from the list
 * - Toolbar (search + filters) wraps responsively on narrow admin viewports
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuthStore } from "../../../store";
import CategorySearch from "../../../components/admin/categories/CategorySearch/CategorySearch";
import CategoryFilters from "../../../components/admin/categories/CategoryFilters/CategoryFilters";
import CategoriesTable from "../../../components/admin/categories/CategoriesTable/CategoriesTable";

const CategoriesPage = () => {
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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Categories
        </h1>
        <Link
          to="/admin/categories/create"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CategorySearch />
        <CategoryFilters />
      </div>

      <CategoriesTable />
    </div>
  );
};

export default CategoriesPage;