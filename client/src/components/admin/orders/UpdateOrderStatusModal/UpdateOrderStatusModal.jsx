/**
 * COMPONENT: src/components/admin/orders/UpdateOrderStatusModal/UpdateOrderStatusModal.jsx
 *
 * PURPOSE:
 * Modal dialog for admin to update an order's fulfilment status.
 * Shows the current status, and provides a dropdown to select the new status.
 *
 * BACKEND INTEGRATION:
 * Calls useUpdateOrderStatus() mutation which does PATCH /api/orders/:id/status
 * with body { status }. Backend order.service.js's updateOrderStatus handles
 * Inventory side effects (confirmCheckout for pending->confirmed,
 * abandonCheckout for cancelled).
 *
 * STATUS FLOW (backend enforced):
 *   pending -> confirmed -> processing -> shipped -> delivered
 *   Any non-terminal -> cancelled
 *   Terminal states (delivered, cancelled, refunded) cannot transition further
 */

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useAdminOrdersStore } from "../../../../store/adminOrders.store";
import { useUpdateOrderStatus } from "../../../../hooks/useAdminOrders";
import { OrderStatusBadge } from "../OrderStatusBadge/OrderStatusBadge";

const STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export const UpdateOrderStatusModal = () => {
  const { isOpen, order } = useAdminOrdersStore((s) => s.updateStatusModal);
  const closeModal = useAdminOrdersStore((s) => s.closeUpdateStatusModal);
  const updateMutation = useUpdateOrderStatus();

  const [selectedStatus, setSelectedStatus] = useState("");

  // Reset selected status when modal opens with a new order
  if (isOpen && order && !selectedStatus) {
    // Set default to first available transition
    const transitions = STATUS_TRANSITIONS[order.status] || [];
    if (transitions.length > 0 && !selectedStatus) {
      // We can't call setState during render, schedule it
      setTimeout(() => setSelectedStatus(transitions[0]), 0);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus || !order) return;

    try {
      await updateMutation.mutateAsync({
        orderId: order._id,
        status: selectedStatus,
      });
      closeModal();
    } catch (err) {
      // Error handled by the mutation
    }
  };

  const handleClose = () => {
    if (!updateMutation.isPending) {
      setSelectedStatus("");
      closeModal();
    }
  };

  if (!isOpen || !order) return null;

  const availableTransitions = STATUS_TRANSITIONS[order.status] || [];
  const isTerminal = availableTransitions.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Update Order Status
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {order.orderNumber || order._id.slice(-8).toUpperCase()}
            </span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Current status:
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        {isTerminal ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            This order is in a terminal state and cannot be updated further.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                required
              >
                <option value="" disabled>
                  Select status…
                </option>
                {availableTransitions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {updateMutation.isError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {updateMutation.error?.response?.data?.message ||
                  updateMutation.error?.message ||
                  "Failed to update status. Please try again."}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={updateMutation.isPending}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedStatus || updateMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Update Status
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateOrderStatusModal;

