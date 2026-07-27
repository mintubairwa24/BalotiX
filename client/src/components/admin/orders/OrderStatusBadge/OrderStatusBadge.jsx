/**
 * COMPONENT: src/components/admin/orders/OrderStatusBadge/OrderStatusBadge.jsx
 *
 * PURPOSE:
 * Renders a colored badge for order fulfilment status. Maps each backend
 * status value ("pending", "confirmed", "processing", "shipped", "delivered",
 * "cancelled", "refunded") to a distinct color scheme.
 *
 * REUSES:
 * Same status enum as the backend order.model.js — no invented statuses.
 */

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

const LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const OrderStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const label = LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
};

export const PaymentStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    refunded: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const labels = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  };

  const style = styles[status] || styles.pending;
  const label = labels[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
};

export default OrderStatusBadge;

