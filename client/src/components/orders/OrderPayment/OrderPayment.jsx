/**
 * src/components/orders/OrderPayment/OrderPayment.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays payment information for an order — status badge plus
 * payment ID/method if available. DIRECTLY REUSES PaymentStatus (Phase
 * 13) for the badge rather than reimplementing paid/pending/failed
 * styling a second time.
 * 
 * WHY PaymentStatus (Phase 13) AND NOT OrderStatusBadge (this phase):
 * These represent two different dimensions on purpose (see
 * OrderStatusBadge's header comment) — order.status is the fulfillment
 * lifecycle (confirmed/processing/shipped/...), while
 * order.paymentStatus is specifically paid/pending/failed. This
 * component reads paymentStatus and renders it with the SAME badge
 * component Phase 13's PaymentSuccessPage/PaymentFailedPage already use,
 * so a "Paid" badge looks identical whether the user sees it on the
 * payment confirmation page or here in order history.
 * 
 * Props:
 * - order: { paymentStatus, paymentId, paymentMethod }
 *   (paymentId/paymentMethod are optional — rendered only if present,
 *   since not all backends expose the raw Razorpay payment ID to the client)
 */

import { PaymentStatus } from "../../payment/PaymentStatus/PaymentStatus";

export const OrderPayment = ({ order }) => {
  if (!order) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Payment
      </h3>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Status
        </span>
        <PaymentStatus status={order.paymentStatus || "pending"} size="sm" />
      </div>

      {order.paymentMethod && (
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Method</span>
          <span className="text-gray-900 dark:text-white capitalize">
            {order.paymentMethod}
          </span>
        </div>
      )}

      {order.paymentId && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Payment ID
          </span>
          <span className="font-mono text-xs text-gray-900 dark:text-white">
            {order.paymentId}
          </span>
        </div>
      )}
    </div>
  );
};