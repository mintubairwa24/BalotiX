/**
 * COMPONENT: src/components/admin/orders/OrderRow/OrderRow.jsx
 *
 * PURPOSE:
 * Renders a single order row inside OrdersTable. Displays order number,
 * customer info, total amount, status badges, date, and action buttons.
 *
 * BACKEND DATA:
 * Each order object from GET /api/orders contains:
 *   _id, orderNumber, userId: { _id, name, email }, subtotal, discountAmount,
 *   totalAmount, status, paymentStatus, appliedCoupon, createdAt, etc.
 */

import { Link } from "react-router-dom";
import { Eye, ChevronRight } from "lucide-react";
import { OrderStatusBadge, PaymentStatusBadge } from "../OrderStatusBadge/OrderStatusBadge.jsx";

const formatCurrency = (amount) =>
  `₹${(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const OrderRow = ({ order }) => {
  const customerName = order.userId?.name || "—";
  const customerEmail = order.userId?.email || "—";

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
      <td className="p-3">
        <Link
          to={`/admin/orders/${order._id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          {order.orderNumber || order._id.slice(-8).toUpperCase()}
        </Link>
      </td>
      <td className="p-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {customerName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{customerEmail}</p>
      </td>
      <td className="p-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {formatCurrency(order.totalAmount)}
      </td>
      <td className="p-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="p-3">
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>
      <td className="p-3 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(order.createdAt)}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/orders/${order._id}`}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
            aria-label="View order details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            to={`/admin/orders/${order._id}`}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Open order"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default OrderRow;

