/**
 * COMPONENT: src/components/admin/orders/OrdersEmpty/OrdersEmpty.jsx
 *
 * PURPOSE:
 * Empty state shown when the orders list returns zero results.
 * Provides context-appropriate messaging: no orders exist at all vs.
 * no orders match the current filters.
 */

import { ShoppingCart } from "lucide-react";
import { useAdminOrdersStore } from "../../../../store/adminOrders.store";

export const OrdersEmpty = () => {
  const { search, status, paymentStatus } = useAdminOrdersStore();

  const hasFilters = search || status || paymentStatus;

  return (
    <tr>
      <td colSpan={8} className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <ShoppingCart className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {hasFilters ? "No matching orders found" : "No orders yet"}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {hasFilters
            ? "Try adjusting your search or filters."
            : "Orders will appear here once customers start checking out."}
        </p>
      </td>
    </tr>
  );
};

export default OrdersEmpty;

