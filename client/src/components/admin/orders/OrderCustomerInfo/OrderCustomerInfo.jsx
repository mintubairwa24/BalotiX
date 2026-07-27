/**
 * COMPONENT: src/components/admin/orders/OrderCustomerInfo/OrderCustomerInfo.jsx
 *
 * PURPOSE:
 * Displays customer information on the order details page.
 * Reads from order.userId which is populated by the backend with name and email.
 *
 * BACKEND DATA:
 * order.userId = { _id, name, email } — populated by backend's getAllOrders
 * using .populate("userId", "name email")
 */

import { User } from "lucide-react";

export const OrderCustomerInfo = ({ order }) => {
  const customer = order?.userId || {};

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <User className="h-4 w-4 text-gray-400" />
        Customer Information
      </h3>
      <div className="space-y-2">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Name</span>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {customer.name || "—"}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {customer.email || "—"}
          </p>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Customer ID
          </span>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {order?.userId?._id || order?.userId || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderCustomerInfo;

