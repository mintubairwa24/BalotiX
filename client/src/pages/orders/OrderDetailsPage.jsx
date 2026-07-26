/**
 * src/pages/orders/OrderDetailsPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Full order detail page at route /orders/:orderId. Composes every
 * order-related component built this phase into a single review screen
 * — items, shipping address, payment info, status timeline, and price
 * summary — plus an optional cancel action.
 * 
 * CANCEL ORDER — CONDITIONAL BY DESIGN:
 * Per the phase instructions ("Cancel order (only if backend supports
 * it)"), the cancel button is ONLY rendered when order.status is in an
 * allowed set (CANCELLABLE_STATUSES below — assumed "pending_payment"
 * and "confirmed", i.e. before shipping begins). This is a frontend UX
 * convenience; the backend remains the actual authority and will reject
 * the cancelOrder() call regardless if the transition isn't allowed.
 * If your backend does not support order cancellation at all, remove
 * the CANCELLABLE_STATUSES check's true branch (or set it to an empty
 * array) to hide the button entirely — no other file needs to change.
 * 
 * A native confirmation step (via orders.store's cancel modal state)
 * is required before the destructive action fires, same principle as
 * AddressList's delete confirmation (Phase 11).
 * 
 * BACKEND INTEGRATION:
 * - GET /orders/:id (useOrderDetails, this phase)
 * - PATCH /orders/:id/cancel (useCancelOrder, this phase)
 * 
 * REUSE (all this phase's components, composed together):
 * - OrderItems, OrderAddress (wraps AddressCard, Phase 11), OrderPayment
 *   (wraps PaymentStatus, Phase 13), OrderTimeline, OrderSummary,
 *   OrderStatusBadge, OrderSkeleton (variant="detail")
 * 
 * NOT IN SCOPE (per phase instructions):
 * Invoice generation, reorder, returns, refund requests, admin tooling.
 */

import { useParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, XCircle } from "lucide-react";

import { useOrderDetails, useCancelOrder } from "../../hooks/useOrders";
import { useOrdersStore } from "../../store/orders.store";

import {
  OrderItems,
  OrderAddress,
  OrderPayment,
  OrderTimeline,
  OrderSummary,
  OrderStatusBadge,
  OrderSkeleton,
} from "../../components/orders";

// Only orders in these statuses can be cancelled from the UI.
// Adjust to match your backend's actual allowed-transition rules.
const CANCELLABLE_STATUSES = ["pending_payment", "confirmed"];

export const OrderDetailsPage = () => {
  const { orderId } = useParams();

  const { data: order, isLoading, isError, error } = useOrderDetails(orderId);

  const {
    isCancelModalOpen,
    orderIdPendingCancel,
    openCancelModal,
    closeCancelModal,
  } = useOrdersStore();

  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder({
    onSuccess: () => closeCancelModal(),
  });

  const canCancel = order && CANCELLABLE_STATUSES.includes(order.status);

  const handleConfirmCancel = () => {
    if (orderIdPendingCancel) {
      cancelOrder(orderIdPendingCancel);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={16} />
          Back to Orders
        </Link>

        {/* Loading State */}
        {isLoading && <OrderSkeleton variant="detail" />}

        {/* Error State */}
        {isError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Unable to load order
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                {error?.message || "Something went wrong"}
              </p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {!isLoading && !isError && order && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                  {order.orderNumber || order._id}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            {/* Timeline */}
            <OrderTimeline order={order} />

            {/* Items */}
            <OrderItems items={order.items} />

            {/* Address */}
            <OrderAddress address={order.shippingAddress} />

            {/* Payment */}
            <OrderPayment order={order} />

            {/* Price Summary */}
            <OrderSummary order={order} />

            {/* Cancel Action — only for cancellable statuses */}
            {canCancel && (
              <button
                onClick={() => openCancelModal(order._id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium rounded-lg transition-colors"
              >
                <XCircle size={18} />
                Cancel Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeCancelModal}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Cancel this order?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. Your order will be cancelled
              permanently.
            </p>
            <div className="flex gap-2">
              <button
                onClick={closeCancelModal}
                disabled={isCancelling}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};