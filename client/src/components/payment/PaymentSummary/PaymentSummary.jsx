/**
 * src/components/payment/PaymentSummary/PaymentSummary.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Shows what the user is about to pay for: order number, item count,
 * and the exact amount payable — all sourced from the Order document
 * (Phase 12's order.service.js -> getOrderById), not recalculated here.
 * 
 * WHY THIS IS SEPARATE FROM CheckoutSummary (Phase 12):
 * CheckoutSummary reads live `cart` totals (subtotal/discount/total)
 * before the order exists. By the time PaymentPage renders, the order
 * has already been created and the cart has been consumed by the
 * backend (Phase 12 flow) — so this component reads the immutable
 * ORDER snapshot instead (order.total, order.orderNumber), which is
 * the correct source of truth at this stage of the funnel. Reusing
 * CheckoutSummary here would require passing it a cart-shaped object
 * that no longer exists, so a small dedicated component is clearer than
 * forcing an ill-fitting reuse.
 * 
 * Props:
 * - order: Order object from getOrderById (Phase 12 order.service.js)
 *   { orderNumber, items, total, appliedCoupon }
 */

export const PaymentSummary = ({ order }) => {
  if (!order) return null;

  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Order Summary
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Order Number</span>
          <span className="font-mono text-gray-900 dark:text-white">
            {order.orderNumber || order._id}
          </span>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Items</span>
          <span>{order.items?.length || 0}</span>
        </div>

        {order.appliedCoupon && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Coupon ({order.appliedCoupon.code})</span>
            <span>-{formatPrice(order.appliedCoupon.discountAmount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />

        <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
          <span>Amount Payable</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
};