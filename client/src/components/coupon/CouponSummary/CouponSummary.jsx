/**
 * src/components/coupon/CouponSummary/CouponSummary.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays applied coupon details and discount summary in CartSummary.
 * Shows coupon code, discount amount, and percentage.
 * Provides "Remove Coupon" button.
 * 
 * Only renders if coupon is actually applied (cart.appliedCoupon exists).
 * 
 * USAGE:
 * const { data: cart } = useCartQuery();
 * 
 * {cart?.appliedCoupon && (
 *   <CouponSummary
 *     coupon={cart.appliedCoupon}
 *     onRemove={() => removeCoupon()}
 *     isRemoving={isRemoving}
 *   />
 * )}
 * 
 * PROPS:
 * - coupon: { code, discountAmount, discountPercentage } (from backend)
 * - onRemove: callback when user clicks remove
 * - isRemoving: boolean (show loading state)
 * 
 * IMPORTANT:
 * All discount values (discountAmount, discountPercentage) come from backend.
 * Frontend DISPLAYS only, never calculates.
 */

import { Trash2, Check } from "lucide-react";

export const CouponSummary = ({ coupon, onRemove, isRemoving = false }) => {
  if (!coupon) return null;

  // Format discount for display
  const formatDiscount = (paise) => {
    if (!paise) return "₹0";
    return `₹${Number(paise).toLocaleString("en-IN")}`;
  };

  return (
    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
      {/* Header with icon */}
      <div className="flex items-start gap-2 mb-2">
        <Check size={18} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-green-700 dark:text-green-300">
            COUPON APPLIED
          </p>
          <p className="text-sm font-mono font-bold text-green-900 dark:text-green-100">
            {coupon.code}
          </p>
        </div>
      </div>

      {/* Discount details */}
      <div className="space-y-1 mb-3 pl-6">
        <div className="flex justify-between text-xs">
          <span className="text-green-700 dark:text-green-300">Discount Amount:</span>
          <span className="font-semibold text-green-900 dark:text-green-100">
            -{formatDiscount(coupon.discountAmount)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-700 dark:text-green-300">Discount Percentage:</span>
          <span className="font-semibold text-green-900 dark:text-green-100">
            {coupon.discountPercentage}%
          </span>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        disabled={isRemoving}
        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 size={14} />
        {isRemoving ? "Removing..." : "Remove Coupon"}
      </button>
    </div>
  );
};