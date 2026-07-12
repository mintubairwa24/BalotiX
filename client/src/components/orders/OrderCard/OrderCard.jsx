/**
 * src/components/orders/OrderCard/OrderCard.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Compact, clickable summary of a single order for the list view
 * (OrdersPage). Deliberately lightweight — only the fields needed to
 * recognize/navigate to an order (number, date, status, total, item
 * count). Full details (items, address, payment, timeline) are loaded
 * separately by OrderDetailsPage only when the user clicks through,
 * keeping the list page fast even with many orders.
 * 
 * REUSE:
 * - OrderStatusBadge (this phase) for the status pill
 * 
 * Props:
 * - order: { _id, orderNumber, status, total, itemCount, createdAt }
 */

import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { OrderStatusBadge } from "../OrderStatusBadge/OrderStatusBadge";

export const OrderCard = ({ order }) => {
  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Link
      to={`/orders/${order._id}`}
      className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
            {order.orderNumber || order._id}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} size="sm" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {order.itemCount ?? order.items?.length ?? 0} item(s)
        </p>
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(order.total)}
          </span>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>
    </Link>
  );
};