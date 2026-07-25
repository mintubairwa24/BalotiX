/**
 * FILE: src/components/admin/inventory/InventoryRow/InventoryRow.jsx
 *
 * Renders a single row in the admin inventory table.
 * Highlights low-stock and out-of-stock items.
 */

import { MoreVertical } from "lucide-react";

const StockStatusBadge = ({ status }) => {
  const statusStyles = {
    in_stock: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    low_stock: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    out_of_stock: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    discontinued: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const statusLabels = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    discontinued: "Discontinued",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status] || statusStyles.discontinued
      }`}
    >
      {statusLabels[status] || "Unknown"}
    </span>
  );
};

export const InventoryRow = ({ item }) => {
  // TODO: Implement action menu (dropdown) for stock updates
  // const openUpdateStockModal = useAdminInventoryStore(s => s.openUpdateStockModal);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <img
            src={item.productImage || "/placeholder.svg"}
            alt={item.productName}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div>
            <div className="font-medium text-gray-800 dark:text-gray-200">{item.productName}</div>
            <div className="text-xs text-gray-500">{item.sku}</div>
          </div>
        </div>
      </td>
      <td className="p-3 text-center text-sm text-gray-600 dark:text-gray-300">
        {item.currentStock}
      </td>
      <td className="p-3 text-center text-sm text-gray-600 dark:text-gray-300">
        {item.reservedStock}
      </td>
      <td className="p-3 text-center text-sm font-bold text-gray-800 dark:text-gray-100">
        {item.availableStock}
      </td>
      <td className="p-3 text-center">
        <StockStatusBadge status={item.status} />
      </td>
      <td className="p-3 text-right">
        <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </button>
      </td>
    </tr>
  );
};