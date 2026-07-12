/**
 * src/components/orders/OrderSummary/OrderSummary.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Price breakdown (subtotal, discount, total) for OrderDetailsPage,
 * reading exclusively from the order's own backend-calculated fields —
 * never recalculated on the frontend, consistent with every prior phase
 * (Cart, Coupon, Checkout, Payment).
 * 
 * RELATIONSHIP TO PaymentSummary (Phase 13):
 * Same visual pattern and same principle (render an immutable order
 * snapshot's totals). Kept as a distinct component in orders/ rather
 * than reused from payment/ for the same layering reason described in
 * OrderItems' header comment — orders/ should not depend on payment/
 * just to render a price breakdown, since PaymentSummary's purpose
 * (context: "you're about to pay this") differs subtly from this
 * component's purpose (context: "here's what this completed order cost").
 * 
 * Props:
 * - order: { subtotal, discountAmount, total, appliedCoupon, itemCount, items }
 */

export const OrderSummary = ({ order }) => {
  if (!order) return null;

  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const hasDiscount = order.discountAmount && order.discountAmount > 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Price Details
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>
            Subtotal ({order.itemCount || order.items?.length || 0} items)
          </span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>

        {hasDiscount && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>
              Coupon Discount
              {order.appliedCoupon?.code ? ` (${order.appliedCoupon.code})` : ""}
            </span>
            <span>-{formatPrice(order.discountAmount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />

        <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
          <span>Total Paid</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
};