/**
 * FILE: src/components/admin/inventory/InventoryEmpty/InventoryEmpty.jsx
 *
 * ============================================================================
 * InventoryEmpty — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders when useAdminInventoryList() resolves with zero items. Unlike
 * ProductsEmpty/CategoriesEmpty, there is NO "Add" CTA here — inventory
 * records aren't created directly, they're provisioned automatically when
 * a product is created (Phase 5/18A). If the list is empty with no active
 * filters, that means there are no products at all, so the CTA instead
 * points to Product Management's create flow — the actual place an admin
 * would go to fix that. Same "point at the real fix, not an action this
 * module doesn't own" reasoning as UserEmpty (Phase 18C) omitting an "Add
 * User" button.
 *
 * REUSES:
 * `hasActiveFilters` is derived from the same adminInventory.store.js
 * fields InventorySearch/InventoryFilters already write to.
 *
 * PRODUCTION-READY BECAUSE:
 * - Dark mode via `dark:` classes (Convention #6)
 * - "Clear filters" calls the store's existing `resetFilters()`
 */

import { Link } from "react-router-dom";
import { PackageSearch, PackagePlus } from "lucide-react";
import { useAdminInventoryStore } from "../../../../store/adminInventory.store";

export const InventoryEmpty = () => {
  const search = useAdminInventoryStore((s) => s.search);
  const status = useAdminInventoryStore((s) => s.status);
  const resetFilters = useAdminInventoryStore((s) => s.resetFilters);

  const hasActiveFilters = Boolean(search || status);

  if (hasActiveFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <PackageSearch className="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          No inventory items match your search or filters.
        </p>
        <button
          onClick={resetFilters}
          className="text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <PackagePlus className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        No inventory yet — inventory records appear automatically once you
        add products.
      </p>
      <Link
        to="/admin/products/create"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Add a Product
      </Link>
    </div>
  );
};

export default InventoryEmpty;