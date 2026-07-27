/**
 * COMPONENT: src/components/admin/orders/OrderFilters/OrderFilters.jsx
 *
 * PURPOSE:
 * Filter controls for the admin orders list. Provides dropdowns for
 * order status and payment status filtering.
 *
 * BACKEND INTEGRATION:
 * Calls setStatus()/setPaymentStatus() on adminOrders.store.js.
 * useAdminOrdersList() reads these values and passes them as query params
 * to GET /api/orders?status=&paymentStatus=.
 *
 * Status values match the backend enum exactly — no invented values.
 */

import { Filter } from "lucide-react";
import { useAdminOrdersStore } from "../../../../store/adminOrders.store";

const ORDER_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_STATUSES = [
  { value: "", label: "All Payments" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export const OrderFilters = () => {
  const status = useAdminOrdersStore((s) => s.status);
  const paymentStatus = useAdminOrdersStore((s) => s.paymentStatus);
  const setStatus = useAdminOrdersStore((s) => s.setStatus);
  const setPaymentStatus = useAdminOrdersStore((s) => s.setPaymentStatus);
  const resetFilters = useAdminOrdersStore((s) => s.resetFilters);

  const hasActiveFilters = status || paymentStatus;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-4 w-4 text-gray-400" />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
      >
        {ORDER_STATUSES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={paymentStatus}
        onChange={(e) => setPaymentStatus(e.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
      >
        {PAYMENT_STATUSES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default OrderFilters;

