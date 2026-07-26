/**
 * src/components/coupon/CouponBadge/CouponBadge.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Compact badge component showing "Coupon Applied" with discount info.
 * Used in multiple places:
 * - CartSummary (inline, next to total)
 * - MiniCart (dropdown)
 * - OrderConfirmation (order summary)
 * 
 * USAGE:
 * <CouponBadge coupon={cart.appliedCoupon} />
 * 
 * PROPS:
 * - coupon: { code, discountAmount, discountPercentage }
 * - size: "sm" | "md" (default "md")
 * - showCode: boolean (show code text, default true)
 * 
 * STYLING:
 * - Green background (success/savings color)
 * - Dark mode support
 * - Responsive sizing
 */

import { Badge } from "lucide-react";

export const CouponBadge = ({
  coupon,
  size = "md",
  showCode = true,
}) => {
  if (!coupon) return null;

  const formatDiscount = (paise) => {
    if (!paise) return "₹0";
    return `₹${Number(paise).toLocaleString("en-IN")}`;
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
  };

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-full text-green-800 dark:text-green-200 font-medium`}
    >
      <Badge size={size === "sm" ? 14 : 16} className="shrink-0" />
      <span>
        {showCode ? `${coupon.code}: ` : ""}
        {formatDiscount(coupon.discountAmount)}
      </span>
    </div>
  );
};