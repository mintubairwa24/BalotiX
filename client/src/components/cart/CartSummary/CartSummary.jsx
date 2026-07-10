/**
 * src/components/cart/CartSummary/CartSummary.jsx
 *
 * ARCHITECTURAL PURPOSE:
 * Summary section showing totals and "Proceed to Checkout" button
 * Displays breakdown: subtotal, discount, total
 * Handles checkout initiation (useCheckoutStart mutation)
 * Respects checkout lock state
 *
 * PROPS:
 * - cart: Cart object from useCartQuery
 * - isLocked: boolean (cart?.status === "checkout_in_progress")
 * - onCheckoutStart: optional callback after successful checkout start
 *
 * PRICE HANDLING:
 * All prices in PAISE from backend
 * Display: ₹${Number(paise).toLocaleString("en-IN")}
 *
 * CHECKOUT LOCK BEHAVIOR:
 * - If isLocked = true, "Proceed" button is hidden
 * - Show: "Checkout in progress..." message
 * - This allows user to see the lock status visually
 *
 * COUPON DISPLAY:
 * - If cart.appliedCoupon exists:
 *   - Show "COUPON APPLIED" badge
 *   - Show discount amount
 *   - Show coupon code
 * - No option to remove coupon from this component
 *   (That's in Phase 10 Checkout flow if needed)
 */

import { useCheckoutStart } from "../../../hooks/useCart";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { CouponForm } from "../../coupon/CouponForm/CouponForm";
import { CouponSummary } from "../../coupon/CouponSummary/CouponSummary";
import { useRemoveCouponMutation, isCouponApplied } from "../../../hooks/useCoupon";

export const CartSummary = ({ cart, isLocked = false, onCheckoutStart }) => {
  const navigate = useNavigate();
  const { mutate: startCheckout, isPending: isStartingCheckout } =
    useCheckoutStart({
      onSuccess: (data) => {
        if (onCheckoutStart) {
          onCheckoutStart(data);
        } else {
          // Default: navigate to checkout with orderId
          navigate(`/checkout?orderId=${data.orderId}`);
        }
      },
    });

  const { mutate: removeCoupon, isPending: isRemoving } = useRemoveCouponMutation();

  if (!cart) {
    return null;
  }

  const formatPrice = (paise) => {
    if (!paise) return "₹0";
    return `₹${Number(paise).toLocaleString("en-IN")}`;
  };

  const subtotal = Number(cart.subtotal || 0);
  const total = Number(cart.total || 0);
  const discountAmount = subtotal - total;
  const discountPercentage =
    subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      {/* Checkout Lock Warning */}
      {isLocked && (
        <div className="mb-6 flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <ShieldAlert
            size={20}
            className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
          />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Checkout in Progress
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Your cart is locked. Complete or cancel your current checkout to
              make changes.
            </p>
          </div>
        </div>
      )}

      {/* Summary Breakdown */}
      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatPrice(subtotal)}
          </span>
        </div>

        {/* Discount (if any) */}
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-green-700 dark:text-green-400">
              Discount ({discountPercentage}%)
            </span>
            <span className="font-medium text-green-700 dark:text-green-400">
              -{formatPrice(discountAmount)}
            </span>
          </div>
        )}

        {/* Coupon Applied Badge */}
        {cart.appliedCoupon && (
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Coupon Applied
              </p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {cart.appliedCoupon.code}
              </p>
            </div>
            <p className="font-semibold text-blue-600 dark:text-blue-400">
              -{formatPrice(cart.appliedCoupon.discountAmount)}
            </p>
          </div>
        )}

        {/* Coupon Section */}
        {!isLocked && !cart.appliedCoupon && <CouponForm />}

        {/* Applied Coupon Display */}
        {isCouponApplied(cart) && (
          <CouponSummary
            coupon={cart.appliedCoupon}
            onRemove={() => removeCoupon()}
            isRemoving={isRemoving}
          />
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3" />

        {/* Total */}
        <div className="flex justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Total
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      {!isLocked ? (
        <button
          onClick={() => startCheckout()}
          disabled={isStartingCheckout || !cart?.items?.length}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {isStartingCheckout ? "Processing..." : "Proceed to Checkout"}
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg cursor-not-allowed"
        >
          Checkout Locked
        </button>
      )}

      {/* Continue Shopping Link */}
      <button
        onClick={() => navigate("/")}
        className="w-full mt-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  );
};
