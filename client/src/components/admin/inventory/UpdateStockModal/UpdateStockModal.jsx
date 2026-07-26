/**
 * FILE: src/components/admin/inventory/UpdateStockModal/UpdateStockModal.jsx
 *
 * ============================================================================
 * UpdateStockModal — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The modal shell around StockAdjustmentForm, opened when
 * `updateStockModalProductId` is set on adminInventory.store.js (via
 * InventoryActions' "Update Stock" button). This is a THIN wrapper — all
 * the actual form logic and the useAdjustStock() mutation live in
 * StockAdjustmentForm, which this modal reuses as-is rather than
 * duplicating.
 *
 * WHY THIS MODAL SHOWS THE PRODUCT'S CURRENT STOCK FOR CONTEXT:
 * An admin adjusting stock benefits from seeing the CURRENT number right
 * above the form (rather than needing to remember it from the table row
 * they just left) — this looks it up from useAdminInventoryDetail(),
 * consistent with every other admin modal in this project that fetches
 * whatever minimal context it needs independently (see DeleteUserModal,
 * Phase 18C, fetching via useAdminUserDetail rather than relying on
 * props).
 *
 * WHY SELF-CONTAINED (not importing a shared Modal primitive):
 * Same reasoning as every prior modal in this project — avoids an
 * unverified cross-import risking a broken build; swappable later as an
 * isolated follow-up.
 *
 * PRODUCTION-READY BECAUSE:
 * - Backdrop click and Escape both close
 * - Closes itself automatically on a successful adjustment (via
 *   StockAdjustmentForm's `onSuccess` callback) — no extra click needed
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect } from "react";
import { X, Package } from "lucide-react";
import { useAdminInventoryStore } from "../../../../store/adminInventory.store";
import { useAdminInventoryDetail } from "../../../../hooks/useAdminInventory";
import { StockAdjustmentForm } from "../StockAdjustmentForm/StockAdjustmentForm";

export const UpdateStockModal = () => {
  const productId = useAdminInventoryStore((s) => s.updateStockModalProductId);
  const closeUpdateStockModal = useAdminInventoryStore((s) => s.closeUpdateStockModal);
  const isOpen = Boolean(productId);

  const { item } = useAdminInventoryDetail(isOpen ? productId : null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeUpdateStockModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeUpdateStockModal]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={closeUpdateStockModal}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-stock-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={closeUpdateStockModal}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950">
          <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h2 id="update-stock-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
          Update Stock{item?.productName ? ` — ${item.productName}` : ""}
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Current stock: <span className="font-medium">{item?.currentStock ?? "—"}</span>
        </p>

        <StockAdjustmentForm
          productId={productId}
          currentStock={item?.currentStock}
          onSuccess={closeUpdateStockModal}
        />
      </div>
    </div>
  );
};

export default UpdateStockModal;
