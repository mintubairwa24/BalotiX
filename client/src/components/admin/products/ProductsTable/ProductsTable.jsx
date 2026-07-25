/**
 * FILE: src/components/admin/products/ProductsTable/ProductsTable.jsx
 *
 * ============================================================================
 * ProductsTable — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the product list itself — column headers
 * (with click-to-sort), the list of ProductRow's, and the loading/error/
 * empty states, ending with ProductsPagination. This is the products
 * feature's equivalent of Phase 17's DashboardOverview: the one place that
 * calls the list-fetching hook and hands data down to purely presentational
 * children.
 *
 * SORTING — REUSES BACKEND SORT (Convention: "reuse backend ... sorting"):
 * Clicking a sortable header calls `setSort(field, nextOrder)` on
 * adminProducts.store.js, which useAdminProductsList() already includes in
 * its queryKey and its GET /admin/products params. The backend does the
 * actual sorting (reusing whatever sort implementation the Phase 5/7
 * catalog already has) — this component only tracks and toggles
 * asc/desc per column, never sorts the array client-side.
 *
 * PRODUCTION-READY BECAUSE:
 * - Loading state renders ProductsSkeleton INSIDE the same <table> markup
 *   (not a separate full-page skeleton), so the table headers stay visible
 *   even while rows are loading — avoids a jarring full-section swap on
 *   every page/filter change
 * - Error state gives an explicit retry rather than a silent empty table
 *   (Convention #7)
 * - Empty state (ProductsEmpty) only renders once loading is confirmed
 *   finished AND zero rows returned — never flashes prematurely
 */

import { ArrowUpDown, AlertCircle } from "lucide-react";
import { useAdminProductsList } from "../../../../hooks/useAdminProducts";
import { useAdminProductsStore } from "../../../../store/adminProducts.store";
import ProductRow from "../ProductRow/ProductRow";
import ProductsSkeleton from "../ProductsSkeleton/ProductsSkeleton";
import ProductsEmpty from "../ProductsEmpty/ProductsEmpty";
import ProductsPagination from "../ProductsPagination/ProductsPagination";

const COLUMNS = [
  { key: "image", label: "", sortable: false },
  { key: "name", label: "Product", sortable: true },
  { key: "effectivePrice", label: "Price", sortable: true },
  { key: "stockQuantity", label: "Stock", sortable: true },
  { key: "isActive", label: "Status", sortable: false },
  { key: "actions", label: "", sortable: false },
];

const ProductsTable = () => {
  const { products, pagination, isLoading, isError, error, refetch } =
    useAdminProductsList();

  const sortBy = useAdminProductsStore((s) => s.sortBy);
  const sortOrder = useAdminProductsStore((s) => s.sortOrder);
  const setSort = useAdminProductsStore((s) => s.setSort);

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
            {isLoading && <ProductsSkeleton rows={pagination?.limit ?? 5} />}

            {!isLoading &&
              !isError &&
              products.map((product) => (
                <ProductRow key={product._id} product={product} />
              ))}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="flex items-center justify-between p-6 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error?.message ?? "Couldn't load products."}
          </span>
          <button
            onClick={refetch}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && <ProductsEmpty />}

      {!isLoading && !isError && products.length > 0 && (
        <div className="p-4">
          <ProductsPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
