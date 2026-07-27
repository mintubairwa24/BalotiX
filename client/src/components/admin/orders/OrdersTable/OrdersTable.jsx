/**
 * COMPONENT: src/components/admin/orders/OrdersTable/OrdersTable.jsx
 *
 * PURPOSE:
 * The composition root for the orders list — headers with sort controls,
 * OrderRow list, and loading/error/empty/pagination states. This is the
 * orders feature's equivalent of ProductsTable from Phase 18A.
 *
 * SORTING — reuses backend sort:
 * Clicking a sortable header calls setSort(field, nextOrder) on the store,
 * which useAdminOrdersList() includes in its queryKey and params.
 * The backend does the actual sorting — never sorts client-side.
 *
 * BACKEND INTEGRATION:
 * GET /api/orders?page=&limit=&status=&paymentStatus=&search=&sortBy=&sortOrder=
 * Response: { success, data: { orders: [...], pagination: {...} } }
 */

import { ArrowUpDown, AlertCircle } from "lucide-react";
import { useAdminOrdersList } from "../../../../hooks/useAdminOrders";
import { useAdminOrdersStore } from "../../../../store/adminOrders.store";
import OrderRow from "../OrderRow/OrderRow";
import OrdersSkeleton from "../OrdersSkeleton/OrdersSkeleton";
import OrdersEmpty from "../OrdersEmpty/OrdersEmpty";
import OrdersPagination from "../OrdersPagination/OrdersPagination";
import OrderActions from "../OrderActions/OrderActions";

const COLUMNS = [
  { key: "orderNumber", label: "Order", sortable: true },
  { key: "customer", label: "Customer", sortable: false },
  { key: "totalAmount", label: "Total", sortable: true },
  { key: "status", label: "Status", sortable: false },
  { key: "paymentStatus", label: "Payment", sortable: false },
  { key: "createdAt", label: "Date", sortable: true },
  { key: "actions", label: "", sortable: false },
];

export const OrdersTable = () => {
  const { orders, pagination, isLoading, isError, error, refetch } =
    useAdminOrdersList();

  const sortBy = useAdminOrdersStore((s) => s.sortBy);
  const sortOrder = useAdminOrdersStore((s) => s.sortOrder);
  const setSort = useAdminOrdersStore((s) => s.setSort);

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
                          sortBy === col.key
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-300 dark:text-gray-600"
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
            {isLoading && <OrdersSkeleton rows={pagination?.limit ?? 10} />}

            {!isLoading && !isError && orders.length === 0 && <OrdersEmpty />}

            {!isLoading &&
              !isError &&
              orders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="flex items-center justify-between p-6 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error?.message ?? "Couldn't load orders."}
          </span>
          <button
            onClick={refetch}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && orders.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <OrdersPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
};

export default OrdersTable;

