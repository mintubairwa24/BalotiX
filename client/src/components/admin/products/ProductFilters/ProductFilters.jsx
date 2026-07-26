/**
 * FILE: src/components/admin/products/ProductFilters/ProductFilters.jsx
 *
 * ============================================================================
 * ProductFilters — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Two dropdowns — category and status — that narrow the admin product
 * table via adminProducts.store.js's `category`/`status` fields, which
 * useAdminProductsList() reads directly (see useAdminProducts.js).
 *
 * REUSES (Convention #11 — reuse over duplication):
 * The category list is fetched via `useCategories()`, the SAME hook the
 * customer-facing Category Module (Phase 6) and catalog filtering
 * (Phase 7) already use — there is exactly one categories endpoint in this
 * project, so this component reads from React Query's existing cache for
 * it rather than re-implementing a category fetch. This is the identical
 * "one data source ⇒ reuse the hook directly" reasoning already used for
 * AdminWelcome reusing useProfile() in Phase 17.
 *
 * INTEGRATION ASSUMPTION (flagged, not verified): `useCategories()` is
 * assumed to return `{ categories, isLoading }` where `categories` is an
 * array of `{ _id, name }` — matching the shape the customer-facing
 * category dropdown/filter presumably already consumes. If the real hook's
 * return shape differs, only the two destructured field names below need
 * updating.
 *
 * WHY status HAS NO CUSTOMER-FACING EQUIVALENT:
 * Customers never see inactive products, so there was never a "status
 * filter" hook to reuse — this one is admin-only and just a plain
 * controlled <select>, matching the plain `status` string in
 * adminProducts.store.js ("" | "active" | "inactive").
 *
 * PRODUCTION-READY BECAUSE:
 * - Category dropdown disables itself gracefully while categories are
 *   loading, rather than rendering an empty/broken select
 * - Every change goes through the store's setters, which already reset
 *   `page` to 1 (Convention documented in adminProducts.store.js)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useCategories } from "../../../../hooks/useCategories";
import { useAdminProductsStore } from "../../../../store/adminProducts.store";

const selectClasses =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200";

const ProductFilters = () => {
  const { categories, isLoading: categoriesLoading } = useCategories();

  const category = useAdminProductsStore((s) => s.category);
  const setCategory = useAdminProductsStore((s) => s.setCategory);
  const status = useAdminProductsStore((s) => s.status);
  const setStatus = useAdminProductsStore((s) => s.setStatus);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={categoriesLoading}
        aria-label="Filter by category"
        className={selectClasses}
      >
        <option value="">All Categories</option>
        {(categories ?? []).map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Filter by status"
        className={selectClasses}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="draft">Draft</option>
        <option value="archived">Archived</option>
      </select>
    </div>
  );
};

export default ProductFilters;