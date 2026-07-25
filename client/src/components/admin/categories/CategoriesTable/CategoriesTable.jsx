/**
 * FILE: src/components/admin/categories/CategoriesTable/CategoriesTable.jsx
 *
 * ============================================================================
 * CategoriesTable — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the category list — column headers (with
 * click-to-sort), CategoryRow's, loading/error/empty states, pagination,
 * and DeleteCategoryModal. Exact sibling of ProductsTable (Phase 18A).
 *
 * WHY DeleteCategoryModal IS MOUNTED HERE, NOT AT THE PAGE LEVEL:
 * Unlike DeleteProductModal (which needs only an id), DeleteCategoryModal
 * needs the full category record to show its dependent-count warning (see
 * that file's header). CategoriesTable already holds the fetched
 * `categories` array from useAdminCategoriesList(), so mounting the modal
 * here — rather than re-fetching or prop-drilling the list up to
 * CategoriesPage and back down — keeps the data flow one-directional and
 * avoids a duplicate fetch.
 *
 * SORTING — REUSES BACKEND SORT:
 * Clicking a sortable header calls `setSort(field, nextOrder)` on
 * adminCategories.store.js, included in useAdminCategoriesList()'s
 * queryKey and GET /admin/categories params. The backend does the actual
 * sorting — this component only tracks and toggles asc/desc per column.
 *
 * PRODUCTION-READY BECAUSE:
 * - Loading state renders CategoriesSkeleton inside the same <table>
 *   markup so headers stay visible during page/filter changes
 * - Error state gives an explicit retry rather than a silent empty table
 * - Empty state only renders once loading is confirmed finished AND zero
 *   rows returned
 */

import { ArrowUpDown, AlertCircle } from "lucide-react";
import { useAdminCategoriesList } from "../../../../hooks/useAdminCategories";
import { useAdminCategoriesStore } from "../../../../store/adminCategories.store";
import CategoryRow from "../CategoryRow/CategoryRow";
import CategoriesSkeleton from "../CategoriesSkeleton/CategoriesSkeleton";
import CategoriesEmpty from "../CategoriesEmpty/CategoriesEmpty";
import CategoriesPagination from "../CategoriesPagination/CategoriesPagination";
import DeleteCategoryModal from "../DeleteCategoryModal/DeleteCategoryModal";

const COLUMNS = [
  { key: "image", label: "", sortable: false },
  { key: "name", label: "Category", sortable: true },
  { key: "productCount", label: "Products", sortable: true },
  { key: "isActive", label: "Status", sortable: false },
  { key: "actions", label: "", sortable: false },
];

export const CategoriesTable = () => {
  const { categories, pagination, isLoading, isError, error, refetch } =
    useAdminCategoriesList();

  const sortBy = useAdminCategoriesStore((s) => s.sortBy);
  const sortOrder = useAdminCategoriesStore((s) => s.sortOrder);
  const setSort = useAdminCategoriesStore((s) => s.setSort);

  const handleSortClick = (key) => {
    const nextOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSort(key, nextOrder);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSortClick(col.key)}
                      className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {col.label}
                      <ArrowUpDown
                        className={`h-3 w-3 ${
                          sortBy === col.key ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <CategoriesSkeleton rows={pagination?.limit ?? 5} />}

            {!isLoading &&
              !isError &&
              categories.map((category) => (
                <CategoryRow key={category._id} category={category} />
              ))}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="flex items-center justify-between p-6 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error?.message ?? "Couldn't load categories."}
          </span>
          <button
            onClick={refetch}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && categories.length === 0 && <CategoriesEmpty />}

      {!isLoading && !isError && categories.length > 0 && (
        <div className="p-4">
          <CategoriesPagination pagination={pagination} />
        </div>
      )}

      <DeleteCategoryModal categories={categories} />
    </div>
  );
};

export default CategoriesTable;