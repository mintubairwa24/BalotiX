/**
 * COMPONENT: src/components/admin/orders/OrderDetails/OrderDetails.jsx
 *
 * PURPOSE:
 * Order details composition root — renders the full detail view for a single
 * order. Composes OrderCustomerInfo, OrderPaymentInfo, OrderedProducts,
 * and OrderStatusBadge.
 *
 * BACKEND INTEGRATION:
 * Receives { order, items } from useAdminOrderDetail(orderId) hook.
 * Backend GET /api/orders/:id returns { order, items } where order.userId
 * is populated with name and email.
 */

import { OrderCustomerInfo } from "../OrderCustomerInfo/OrderCustomerInfo";
import { OrderPaymentInfo } from "../OrderPaymentInfo/OrderPaymentInfo";
import { OrderedProducts } from "../OrderedProducts/OrderedProducts";
import { OrderStatusBadge } from "../OrderStatusBadge/OrderStatusBadge";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const OrderDetails = ({ order, items }) => {
  if (!order) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {order.orderNumber || "Order"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Two-column layout: Customer + Payment */}
      <div className="grid gap-5 sm:grid-cols-2">
        <OrderCustomerInfo order={order} />
        <OrderPaymentInfo order={order} />
      </div>

      {/* Ordered Products */}
      <OrderedProducts items={items} />

      {/* Order Timeline (if backend provides it) */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Timeline
          </h3>
          <div className="space-y-3">
            {order.statusHistory.map((entry, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {entry.status}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;

