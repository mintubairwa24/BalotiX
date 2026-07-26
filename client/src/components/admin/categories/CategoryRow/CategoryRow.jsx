/**
 * FILE: src/components/admin/categories/CategoryRow/CategoryRow.jsx
 *
 * ============================================================================
 * CategoryRow — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a single category's `<tr>` inside CategoriesTable — thumbnail,
 * name + parent category (if any), product count, CategoryStatus
 * (badge/toggle), and CategoryActions (edit/delete). Exact sibling of
 * ProductRow (Phase 18A), reshaped for categories: no price/stock, but
 * adds a parent-category subtext to show the hierarchy at a glance.
 *
 * REUSES:
 * CategoryStatus and CategoryActions (both this phase) are composed here
 * rather than duplicated inline.
 *
 * PRODUCTION-READY BECAUSE:
 * - Falls back to a placeholder icon if a category has no image yet
 * - Long names truncate with `title` tooltip rather than breaking row height
 * - "Top-level" label shown when a category has no parent, rather than a
 *   blank/confusing subtext
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ImageOff } from "lucide-react";
import CategoryStatus from "../CategoryStatus/CategoryStatus";
import CategoryActions from "../CategoryActions/CategoryActions";

export const CategoryRow = ({ category }) => {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
      <td className="p-3">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-12 w-12 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300 dark:border-gray-600 dark:text-gray-600">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </td>
      <td className="max-w-[220px] p-3">
        <p
          title={category.name}
          className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {category.name}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {category.parentCategory?.name ?? "Top-level"}
        </p>
      </td>
      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
        {category.productCount ?? 0}
      </td>
      <td className="p-3">
        <CategoryStatus categoryId={category._id} isActive={category.isActive} />
      </td>
      <td className="p-3">
        <CategoryActions categoryId={category._id} status={category.status} />
      </td>
    </tr>
  );
};

export default CategoryRow;
