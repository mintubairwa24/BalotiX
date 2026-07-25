/**
 * FILE: src/components/admin/categories/CategoryStatistics/CategoryStatistics.jsx
 *
 * ============================================================================
 * CategoryStatistics — Phase 18D
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Summary stat cards at the top of CategoriesPage — total categories,
 * root (top-level) categories, active vs. inactive counts. Same visual
 * pattern as DashboardStats (Phase 17) and UserStatistics (Phase 18C):
 * small icon+number cards, no charts.
 *
 * DATA SOURCE (flagged): computed from the SAME `pagination.totalCount`
 * and current page's `categories` array already fetched by
 * useAdminCategoriesList() for the table — NOT a separate stats endpoint.
 * This means "Active"/"Inactive"/"Root" counts reflect only the CURRENT
 * PAGE's categories, not the whole catalog, unless the backend's list
 * response happens to also return catalog-wide aggregate counts. This is
 * flagged plainly rather than presented as an authoritative dashboard
 * metric — if your backend's GET /admin/categories response includes a
 * separate aggregate summary block, swap this component's data source to
 * that; the card layout itself doesn't need to change.
 *
 * PRODUCTION-READY BECAUSE:
 * - Explicit about being current-page-scoped in an inline caption, so it
 *   never misleads an admin into thinking these are store-wide totals
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Folder, FolderTree, CheckCircle, XCircle } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className={`rounded-lg p-1.5 ${accent}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
    </div>
    <div className="text-xl font-bold text-gray-900 dark:text-gray-50">{value}</div>
  </div>
);

export const CategoryStatistics = ({ categories = [], totalCount = 0 }) => {
  const rootCount = categories.filter((c) => !c.parentCategory).length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Folder}
          label="Total Categories"
          value={totalCount}
          accent="bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
        />
        <StatCard
          icon={FolderTree}
          label="Root (this page)"
          value={rootCount}
          accent="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Active (this page)"
          value={activeCount}
          accent="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
        />
        <StatCard
          icon={XCircle}
          label="Inactive (this page)"
          value={inactiveCount}
          accent="bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        />
      </div>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Root/Active/Inactive counts reflect the current page only.
      </p>
    </div>
  );
};

export default CategoryStatistics;