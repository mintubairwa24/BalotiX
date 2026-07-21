/**
 * FILE: src/components/admin/products/DeleteProductModal/DeleteProductModal.jsx
 *
 * ============================================================================
 * DeleteProductModal — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The single confirmation gate for deleting a product. It reads
 * `deleteModalProductId` from adminProducts.store.js — set by
 * ProductActions when the admin clicks the trash icon — and, if non-null,
 * renders a confirm dialog that calls useDeleteProduct() ONLY after an
 * explicit "Delete" click. This is the same store-holds-target-id /
 * modal-owns-mutation pattern as Phase 11's DeleteAddressModal.
 *
 * WHY SELF-CONTAINED (not importing a shared Modal primitive):
 * Same reasoning as AdminSidebar's mobile drawer in Phase 17 — rather than
 * import an unverified shared Modal component and risk a broken build if
 * its real prop API differs, this implements its own minimal
 * backdrop + centered panel. If your repo already has a shared Modal
 * component with a confirmed API, swapping this file's JSX to delegate to
 * it is a safe, isolated follow-up.
 *
 * UX DETAILS:
 * - Backdrop click AND Escape key both close the modal (never delete)
 * - The confirm button is disabled while the mutation is pending, and
 *   shows inline pending/error state — an admin never has to wonder
 *   whether their click registered
 * - On success, the modal closes itself (via closeDeleteModal) — the
 *   underlying table refresh happens automatically because
 *   useDeleteProduct() already invalidates the products query on success
 *
 * PRODUCTION-READY BECAUSE:
 * - Destructive action requires deliberate confirmation — no accidental
 *   deletes from a stray click
 * - Renders `null` when there's nothing to confirm, rather than always
 *   being mounted and toggled with CSS (keeps focus/escape-key handling
 *   simple and correct)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAdminProductsStore } from "../../../../store/adminProducts.store";
import { useDeleteProduct } from "../../../../hooks/useAdminProducts";

const DeleteProductModal = () => {
  const productId = useAdminProductsStore((s) => s.deleteModalProductId);
  const closeDeleteModal = useAdminProductsStore((s) => s.closeDeleteModal);
  const { mutate: deleteProductMutation, isPending, isError, reset } = useDeleteProduct();

  const isOpen = Boolean(productId);

  // Escape key closes the modal (never triggers delete).
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    closeDeleteModal();
  };

  const handleConfirm = () => {
    deleteProductMutation(productId, {
      onSuccess: () => closeDeleteModal(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>

        <h2
          id="delete-product-title"
          className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50"
        >
          Delete this product?
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          This permanently removes the product from your catalog. This
          action cannot be undone.
        </p>

        {isError && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">
            Something went wrong deleting this product. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;