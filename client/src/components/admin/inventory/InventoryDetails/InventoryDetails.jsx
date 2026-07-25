/**
 * FILE: src/components/admin/inventory/InventoryDetails/InventoryDetails.jsx
 *
 * ============================================================================
 * InventoryDetails — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the inventory detail view — the ONE place that
 * calls useAdminInventoryDetail(productId) and composes the product info
 * card, an INLINE StockAdjustmentForm (not the modal version — a detail
 * page has room for the form to live directly on the page rather than
 * behind a click), and StockHistory. Same "fetch once, compose many
 * presentational children" pattern as UserDetails (Phase 18C) and
 * DashboardOverview (Phase 17).
 *
 * WHY StockAdjustmentForm IS REUSED HERE, NOT DUPLICATED:
 * Exactly the form UpdateStockModal uses — see that component's header
 * for the reasoning. Reusing it here means any future change to
 * adjustment validation or fields only needs to happen in one file.
 *
 * PRODUCTION-READY BECAUSE:
 * - Distinguishes loading / error / success states explicitly
 *   (Convention #7 — never fail silently)
 * - Reuses InventoryStatus for the same visual status language as the
 *   table (Convention: one visual language per concept across a feature)
 */

import { ImageOff } from "lucide-react";
import { useAdminInventoryDetail } from "../../../../hooks/useAdminInventory";
import { InventoryStatus } from "../InventoryStatus/InventoryStatus";
import { StockAdjustmentForm } from "../StockAdjustmentForm/StockAdjustmentForm";
import { StockHistory } from "../StockHistory/StockHistory";
import { InventorySkeleton } from "../InventorySkeleton/InventorySkeleton";

export const InventoryDetails = ({ productId }) => {
  const { item, isLoading, isError, error } = useAdminInventoryDetail(productId);

  if (isLoading) {
    return (
      <div className="p-1">
        <InventorySkeleton variant="detail" />
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        {error?.message ?? "Couldn't load this inventory record. The product may have been deleted."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300 dark:border-gray-600 dark:text-gray-600">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {item.productName}
          </h1>
          {item.sku && (
            <p className="font-mono text-xs text-gray-400 dark:text-gray-500">{item.sku}</p>
          )}
          <div className="mt-1">
            <InventoryStatus status={item.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Current Stock</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-50">{item.currentStock}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Reserved</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-50">{item.reservedStock ?? 0}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock Threshold</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {item.lowStockThreshold ?? "—"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Adjust Stock
        </h2>
        <div className="max-w-sm">
          <StockAdjustmentForm productId={productId} currentStock={item.currentStock} />
        </div>
      </div>

      <StockHistory productId={productId} />
    </div>
  );
};

export default InventoryDetails;
