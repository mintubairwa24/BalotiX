/**
 * FILE: src/components/admin/inventory/InventoryTable/InventoryTable.jsx
 *
 * ============================================================================
 * InventoryTable — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the inventory list — column headers (with
 * click-to-sort), InventoryRow's, loading/error/empty states, pagination,
 * and UpdateStockModal. Exact sibling of ProductsTable/CouponsTable.
 *
 * WHY UpdateStockModal IS MOUNTED HERE:
 * Same reasoning as every prior table-mounted modal in this project — it
 * self-fetches whatever context it needs (via useAdminInventoryDetail
 * inside the modal itself), so mounting it once here covers every row's
 * InventoryActions trigger without prop-drilling.
 *
 * SORTING — REUSES BACKEND SORT:
 * Clicking a sortable header calls `setSort(field, nextOrder)` on
 * adminInventory.store.js, included in useAdminInventoryList()'s
 * queryKey and GET /admin/inventory params. The backend does the actual
 * sorting.
 *
 * PRODUCTION-READY BECAUSE:
 * - Loading state renders InventorySkeleton inside the same <table>
 *   markup so headers stay visible during page/filter changes
 * - Error state gives an explicit retry rather than a silent empty table
 */

import { ArrowUpDown, AlertCircle } from "lucide-react";
import { useAdminInventoryList } from "../../../../hooks/useAdminInventory";
import { useAdminInventoryStore } from "../../../../store/adminInventory.store";
import { InventoryRow } from "../InventoryRow/InventoryRow";
import { InventorySkeleton } from "../InventorySkeleton/InventorySkeleton";
import { InventoryEmpty } from "../InventoryEmpty/InventoryEmpty";
import { InventoryPagination } from "../InventoryPagination/InventoryPagination";
import { UpdateStockModal } from "../UpdateStockModal/UpdateStockModal";

const COLUMNS = [
  { key: "image", label: "", sortable: false },
  { key: "productName", label: "Product", sortable: true },
  { key: "warehouseStock", label: "Stock", sortable: true },
  { key: "status", label: "Status", sortable: false },
  { key: "actions", label: "", sortable: false },
];

export const InventoryTable = () => {
  const { items, pagination, isLoading, isError, error, refetch } =
    useAdminInventoryList();

  const sortBy = useAdminInventoryStore((s) => s.sortBy);
  const sortOrder = useAdminInventoryStore((s) => s.sortOrder);
  const setSort = useAdminInventoryStore((s) => s.setSort);

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
                  scope="col"
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
            {isLoading && <InventorySkeleton variant="row" rows={pagination?.limit ?? 5} />}

            {!isLoading &&
              !isError &&
              items.map((item) => <InventoryRow key={item.inventoryId} item={item} />)}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="flex items-center justify-between p-6 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error?.response?.data?.message ?? error?.message ?? "Couldn't load inventory."}
          </span>
          <button
            onClick={refetch}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && <InventoryEmpty />}

      {!isLoading && !isError && items.length > 0 && (
        <div className="p-4">
          <InventoryPagination pagination={pagination} />
        </div>
      )}

      <UpdateStockModal />
    </div>
  );
};

export default InventoryTable;
