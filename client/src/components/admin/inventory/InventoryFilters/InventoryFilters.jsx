/**
 * FILE: src/components/admin/inventory/InventoryFilters/InventoryFilters.jsx
 *
 * ============================================================================
 * InventoryFilters — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A status dropdown narrowing the admin inventory table via
 * adminInventory.store.js's `status` field, which useAdminInventoryList()
 * reads directly. Simple, single-dropdown filter — sibling to
 * CouponFilters (Phase 18E) in shape.
 *
 * WHY THE VALUES SENT ARE THE BACKEND'S OWN STATUS STRINGS:
 * "in_stock" / "low_stock" / "out_of_stock" are sent verbatim as the
 * `status` query param, matching exactly what the backend is assumed to
 * return per-item (see admin.service.js's header) — this filter doesn't
 * invent its own threshold-based filtering logic client-side, it just
 * asks the backend to filter by the same status concept it already
 * computes and returns.
 *
 * PRODUCTION-READY BECAUSE:
 * - Every change goes through the store's setter, which already resets
 *   `page` to 1
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useAdminInventoryStore } from "../../../../store/adminInventory.store";

export const InventoryFilters = () => {
  const status = useAdminInventoryStore((s) => s.status);
  const setStatus = useAdminInventoryStore((s) => s.setStatus);

  return (
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      aria-label="Filter by stock status"
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
    >
      <option value="">All Stock Levels</option>
      <option value="in_stock">In Stock</option>
      <option value="low_stock">Low Stock</option>
      <option value="out_of_stock">Out of Stock</option>
    </select>
  );
};

export default InventoryFilters;