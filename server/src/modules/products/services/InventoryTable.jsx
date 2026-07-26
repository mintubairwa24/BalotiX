/**
 * FILE: src/components/admin/inventory/InventoryTable/InventoryTable.jsx
 *
 * The main table component for the admin inventory page.
 * Handles loading, error, and empty states.
 */

import { ArrowUpDown, AlertCircle } from "lucide-react";
import { useAdminInventoryList } from "../../../../hooks/useAdminInventory";
import { useAdminInventoryStore } from "../../../../store/adminInventory.store";
import { InventoryRow } from "../InventoryRow/InventoryRow";
// import InventorySkeleton from "../InventorySkeleton/InventorySkeleton";
// import InventoryEmpty from "../InventoryEmpty/InventoryEmpty";
// import InventoryPagination from "../InventoryPagination/InventoryPagination";

const COLUMNS = [
  { key: "productName", label: "Product", sortable: true },
  { key: "warehouseStock", label: "Total Stock", sortable: true, className: "text-center" },
  { key: "reservedStock", label: "Reserved", sortable: true, className: "text-center" },
  { key: "availableStock", label: "Available", sortable: true, className: "text-center" },
  { key: "status", label: "Status", sortable: true, className: "text-center" },
  { key: "actions", label: "", sortable: false, className: "text-right" },
];

export const InventoryTable = () => {
  const { data, isLoading, isError, error, refetch } = useAdminInventoryList();
  const items = data?.items ?? [];
  const pagination = data?.pagination;

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
                  className={`p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 ${col.className ?? ''}`}
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
            {/* {isLoading && <InventorySkeleton rows={10} />} */}
            {isLoading && <tr><td colSpan={COLUMNS.length} className="p-6 text-center text-gray-500">Loading...</td></tr>}

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
            {error?.response?.data?.message ?? "Couldn't load inventory."}
          </span>
          <button
            onClick={() => refetch()}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* {!isLoading && !isError && items.length === 0 && <InventoryEmpty />} */}
      {!isLoading && !isError && items.length === 0 && <tr><td colSpan={COLUMNS.length} className="p-6 text-center text-gray-500">No inventory items found.</td></tr>}

      {/* {!isLoading && !isError && items.length > 0 && <InventoryPagination pagination={pagination} />} */}
    </div>
  );
};