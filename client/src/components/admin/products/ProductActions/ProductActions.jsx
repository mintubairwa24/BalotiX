/**
 * FILE: src/components/admin/products/ProductActions/ProductActions.jsx
 *
 * ============================================================================
 * ProductActions — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The Edit / Delete icon-button pair rendered at the end of each
 * ProductRow. Kept as its own component (rather than inlined in
 * ProductRow) because it's the one part of a row with actual interaction
 * logic — separating it keeps ProductRow itself a simple, mostly-
 * presentational row-layout component.
 *
 * WHY DELETE DOESN'T DELETE DIRECTLY:
 * Clicking Delete only calls `openDeleteModal(productId)` on
 * adminProducts.store.js — it does NOT call useDeleteProduct() itself.
 * The actual destructive mutation lives in DeleteProductModal, which is
 * the single confirmation gate for every delete in this feature, so a
 * mis-click can never immediately destroy a product. Same "store holds
 * WHICH item, modal owns the actual mutation" pattern as Phase 11's
 * DeleteAddressModal.
 *
 * PRODUCTION-READY BECAUSE:
 * - Edit is a real <Link> (proper navigation, works with browser
 *   back/forward, opens in new tab on ctrl/cmd-click) rather than a
 *   button + programmatic navigate()
 * - Icon-only buttons carry `aria-label`s for screen readers
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useAdminProductsStore } from "../../../../store/adminProducts.store";

const ProductActions = ({ productId }) => {
  const openDeleteModal = useAdminProductsStore((s) => s.openDeleteModal);

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={`/admin/products/${productId}/edit`}
        aria-label="Edit product"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={() => openDeleteModal(productId)}
        aria-label="Delete product"
        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ProductActions;