/**
 * FILE: src/components/admin/categories/CategoryFilters/CategoryFilters.jsx
 *
 * ============================================================================
 * CategoryFilters — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Two dropdowns — status and parent category — that narrow the admin
 * category table via adminCategories.store.js's `status`/`parentFilter`
 * fields, which useAdminCategoriesList() reads directly.
 *
 * REUSES (Convention #11 — reuse over duplication):
 * The parent-category dropdown's OPTIONS come from `useCategories()`, the
 * SAME hook the customer-facing Category Module (Phase 6) already uses —
 * one categories data source across the whole app, same reasoning already
 * used for ProductFilters' category dropdown in Phase 18A.
 *
 * INTEGRATION ASSUMPTION (flagged, not verified): `useCategories()` is
 * assumed to return `{ categories, isLoading }` where `categories` is an
 * array of `{ _id, name }`. If the real shape differs, only the two
 * destructured field names below need updating.
 *
 * WHY status HAS NO CUSTOMER-FACING EQUIVALENT:
 * Same reasoning as ProductFilters — customers never see inactive
 * categories, so this is a plain admin-only controlled <select> against
 * adminCategories.store.js's `status` string ("" | "active" | "inactive").
 *
 * PRODUCTION-READY BECAUSE:
 * - Parent dropdown disables itself gracefully while categories are loading
 * - Every change goes through the store's setters, which already reset
 *   `page` to 1
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useCategories } from "../../../../hooks/useCategories";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";

const selectClasses =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200";

const CategoryFilters = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();

  const status = useAdminCategoriesStore((s) => s.status);
  const setStatus = useAdminCategoriesStore((s) => s.setStatus);
  const parentFilter = useAdminCategoriesStore((s) => s.parentFilter);
  const setParentFilter = useAdminCategoriesStore((s) => s.setParentFilter);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Filter by status"
        className={selectClasses}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select
        value={parentFilter}
        onChange={(e) => setParentFilter(e.target.value)}
        disabled={categoriesLoading}
        aria-label="Filter by parent category"
        className={selectClasses}
      >
        <option value="">All Categories</option>
        <option value="none">Top-level only</option>
        {(categories ?? []).map((cat) => (
          <option key={cat._id} value={cat._id}>
            Children of {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilters;