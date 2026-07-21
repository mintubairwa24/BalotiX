/**
 * FILE: src/components/admin/categories/CategoryActions/CategoryActions.jsx
 *
 * ============================================================================
 * CategoryActions — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The Edit / Delete icon-button pair rendered at the end of each
 * CategoryRow. Exact sibling of ProductActions (Phase 18A) — kept separate
 * from CategoryRow so the row stays a simple, mostly-presentational
 * layout component.
 *
 * WHY DELETE DOESN'T DELETE DIRECTLY:
 * Clicking Delete only calls `openDeleteModal(categoryId)` on
 * adminCategories.store.js — it does NOT call useDeleteCategory() itself.
 * The actual destructive mutation lives in DeleteCategoryModal, the single
 * confirmation gate for every delete in this feature. Same "store holds
 * WHICH item, modal owns the actual mutation" pattern as ProductActions/
 * DeleteProductModal (Phase 18A) and DeleteAddressModal (Phase 11).
 *
 * PRODUCTION-READY BECAUSE:
 * - Edit is a real <Link> (proper navigation, browser back/forward,
 *   ctrl/cmd-click opens new tab) rather than a button + programmatic
 *   navigate()
 * - Icon-only buttons carry `aria-label`s for screen readers
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";

const CategoryActions = ({ categoryId }) => {
  const openDeleteModal = useAdminCategoriesStore((s) => s.openDeleteModal);

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={`/admin/categories/${categoryId}/edit`}
        aria-label="Edit category"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={() => openDeleteModal(categoryId)}
        aria-label="Delete category"
        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CategoryActions;