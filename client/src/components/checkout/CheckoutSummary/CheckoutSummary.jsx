/**
 * src/components/checkout/CheckoutSummary/CheckoutSummary.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays the final price breakdown (subtotal, discount, total) in the
 * checkout right-hand column, using values computed by the backend on
 * the cart object — never recalculated on the frontend.
 * 
 * WHY NOT REUSE CartSummary DIRECTLY:
 * CartSummary (Phase 9) is a "smart" component that also renders its own
 * CouponForm/CouponSummary and a "Proceed to Checkout" button — both of
 * which are handled elsewhere in the checkout flow (CheckoutCoupon and
 * CheckoutActions respectively) to avoid duplicate buttons/forms on the
 * same page. Rendering CartSummary as-is here would duplicate the coupon
 * UI already shown in CheckoutCoupon and show a "Proceed to Checkout"
 * button that doesn't make sense mid-checkout.
 * 
 * Instead, this component reads the SAME cart fields CartSummary reads
 * (subtotal, discountAmount, total — all backend-calculated) and renders
 * just the numeric breakdown, keeping visual consistency with CartSummary's
 * formatting logic without duplicating its interactive coupon/checkout UI.
 * 
 * Props:
 * - cart: cart object from useCartQuery (Phase 9)
 *   { subtotal, discountAmount, total, itemCount, appliedCoupon }
 */

export const CheckoutSummary = ({ cart }) => {
  if (!cart) return null;

  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const hasDiscount = cart.discountAmount && cart.discountAmount > 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Price Details
      </h3>

      <div className="space-y-2 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>
            Subtotal ({cart.itemCount || cart.items?.length || 0} items)
          </span>
          <span>{formatPrice(cart.subtotal)}</span>
        </div>

        {/* Discount (backend-calculated) */}
        {hasDiscount && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Coupon Discount</span>
            <span>-{formatPrice(cart.discountAmount)}</span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />

        {/* Total */}
        <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
          <span>Total Payable</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </div>

      {hasDiscount && (
        <p className="mt-3 text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded px-2 py-1.5">
          You saved {formatPrice(cart.discountAmount)} on this order
        </p>
      )}
    </div>
  );
};