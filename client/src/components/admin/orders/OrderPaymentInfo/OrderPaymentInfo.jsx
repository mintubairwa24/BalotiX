/**
 * COMPONENT: src/components/admin/orders/OrderPaymentInfo/OrderPaymentInfo.jsx
 *
 * PURPOSE:
 * Displays payment information on the order details page.
 * Shows payment status, total amount, subtotal, discounts, and coupon info
 * from the backend order data.
 *
 * BACKEND DATA:
 * Order fields: subtotal, discountAmount, totalAmount, paymentStatus,
 * appliedCoupon: { couponId, code, discountAmount } | null
 */

import { CreditCard } from "lucide-react";
import { PaymentStatusBadge } from "../OrderStatusBadge/OrderStatusBadge";

const formatCurrency = (amount) =>
  `₹${(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const OrderPaymentInfo = ({ order }) => {
  if (!order) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <CreditCard className="h-4 w-4 text-gray-400" />
        Payment Information
      </h3>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Payment Status
          </span>
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Subtotal
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {formatCurrency(order.subtotal)}
          </span>
        </div>

        {order.discountAmount > 0 && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Discount
              </span>
              <span className="text-sm text-green-600 dark:text-green-400">
                -{formatCurrency(order.discountAmount)}
              </span>
            </div>
            {order.appliedCoupon?.code && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Coupon
                </span>
                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                  {order.appliedCoupon.code}
                </span>
              </div>
            )}
          </>
        )}

        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Total
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPaymentInfo;

