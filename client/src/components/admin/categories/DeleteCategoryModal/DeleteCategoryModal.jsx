/**
 * FILE: src/components/admin/categories/DeleteCategoryModal/DeleteCategoryModal.jsx
 *
 * ============================================================================
 * DeleteCategoryModal — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The single confirmation gate for deleting a category. Reads
 * `deleteModalCategoryId` from adminCategories.store.js — set by
 * CategoryActions when the admin clicks the trash icon — and, if
 * non-null, renders a confirm dialog that calls useDeleteCategory() ONLY
 * after an explicit "Delete" click. Same store-holds-target-id /
 * modal-owns-mutation pattern as DeleteProductModal (Phase 18A).
 *
 * WHY THIS MODAL ALSO NEEDS THE TARGET CATEGORY'S OWN DATA (not just its id):
 * Unlike a product, a category can have DEPENDENTS — child categories
 * and/or assigned products. Deleting a category with either is a decision
 * with real consequences (orphaned children, products losing their
 * category), so this modal looks up the category from the already-loaded
 * admin categories list (via `categories` prop passed down from
 * CategoriesPage, sourced from useAdminCategoriesList()) and shows a
 * pre-delete warning if `productCount > 0`. This is advisory only — the
 * BACKEND remains the actual authority on whether the delete is allowed;
 * this UI doesn't invent a client-side blocking rule, it just surfaces
 * whatever the backend's own response says (including a rejection, shown
 * via the existing error state below) before the admin commits.
 *
 * WHY SELF-CONTAINED (not importing a shared Modal primitive):
 * Same reasoning as DeleteProductModal — avoids an unverified cross-import
 * risking a broken build; swappable later as an isolated follow-up.
 *
 * PRODUCTION-READY BECAUSE:
 * - Backdrop click AND Escape key both close the modal (never delete)
 * - Confirm button disabled while pending; inline error surfaced verbatim
 *   if the backend rejects the delete (e.g. "category has products")
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";
import { useDeleteCategory } from "../../../../hooks/useAdminCategories";

const DeleteCategoryModal = ({ categories = [] }) => {
  const categoryId = useAdminCategoriesStore((s) => s.deleteModalCategoryId);
  const closeDeleteModal = useAdminCategoriesStore((s) => s.closeDeleteModal);
  const { mutate: deleteCategoryMutation, isPending, isError, error, reset } =
    useDeleteCategory();

  const isOpen = Boolean(categoryId);
  const targetCategory = categories.find((c) => c._id === categoryId);

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
    deleteCategoryMutation(categoryId, {
      onSuccess: () => closeDeleteModal(),
    });
  };

  const hasDependents = (targetCategory?.productCount ?? 0) > 0;

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
        aria-labelledby="delete-category-title"
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
          id="delete-category-title"
          className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50"
        >
          Delete this category?
        </h2>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          This permanently removes the category. This action cannot be undone.
        </p>

        {hasDependents && (
          <p className="mb-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            This category has {targetCategory.productCount} product
            {targetCategory.productCount === 1 ? "" : "s"} assigned to it.
            Your backend will determine whether this delete is allowed.
          </p>
        )}

        {isError && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error?.response?.data?.message ??
              "Something went wrong deleting this category. Please try again."}
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

export default DeleteCategoryModal;