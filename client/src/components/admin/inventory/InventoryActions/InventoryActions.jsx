/**
 * FILE: src/components/admin/inventory/InventoryActions/InventoryActions.jsx
 *
 * ============================================================================
 * InventoryActions — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The per-row action control for the Inventory table — "View Details"
 * (navigates to InventoryDetailsPage) and "Update Stock" (opens
 * UpdateStockModal). Exact sibling of ProductActions/CouponActions in
 * shape, but the SECOND action here isn't Edit/Delete — inventory records
 * can't be created or deleted independently (see InventoryEmpty's header),
 * so the only mutating action available from a row is a stock adjustment.
 *
 * WHY "Update Stock" ONLY OPENS A MODAL:
 * Same "store holds WHICH item, modal owns the mutation" pattern as every
 * prior admin action in this project — clicking it only calls
 * `openUpdateStockModal(productId)` on adminInventory.store.js; the
 * actual useAdjustStock() mutation lives inside UpdateStockModal via
 * StockAdjustmentForm.
 *
 * PRODUCTION-READY BECAUSE:
 * - "View Details" is a real <Link> (proper navigation, browser
 *   back/forward, ctrl/cmd-click opens new tab)
 * - Icon+label buttons carry clear intent even for a two-action row where
 *   icon-only might be ambiguous (adjust stock vs. view — worth the extra
 *   width for clarity)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { Eye, PackagePlus } from "lucide-react";
import { useAdminInventoryStore } from "../../../../store/adminInventory.store";

export const InventoryActions = ({ productId }) => {
  const openUpdateStockModal = useAdminInventoryStore((s) => s.openUpdateStockModal);

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={`/admin/inventory/${productId}`}
        aria-label="View inventory details"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <button
        onClick={() => openUpdateStockModal(productId)}
        aria-label="Update stock"
        className="rounded-lg p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-indigo-950 dark:hover:text-indigo-400"
      >
        <PackagePlus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default InventoryActions;