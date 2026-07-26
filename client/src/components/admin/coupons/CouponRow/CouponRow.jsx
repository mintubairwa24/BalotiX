/**
 * FILE: src/components/admin/coupons/CouponRow/CouponRow.jsx
 *
 * ============================================================================
 * CouponRow — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a single coupon's `<tr>` inside CouponsTable — code, discount
 * (formatted per type), expiry, CouponUsage, CouponStatus, and
 * CouponActions. Exact sibling of ProductRow/CategoryRow.
 *
 * MONEY HANDLING (Convention #1 — strict): `minOrderValue` and
 * `maxDiscountAmount` arrive in PAISE. This component does ZERO
 * arithmetic — only formatting, identical technique to ProductRow.
 * `discountValue` itself is NOT money when `discountType === "percentage"`
 * (it's a plain number, e.g. 20 meaning 20%) — only when
 * `discountType === "fixed"` is discountValue itself paise. The
 * formatDiscount helper below branches on type for exactly this reason,
 * rather than always assuming discountValue is money.
 *
 * PRODUCTION-READY BECAUSE:
 * - Discount display adapts to type (₹100 off vs. 20% off) rather than
 *   showing a raw number with no unit context
 * - Expiry date formatted consistently with every other date display in
 *   this project (en-IN locale)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { CouponUsage } from "../CouponUsage/CouponUsage";
import { CouponStatus } from "../CouponStatus/CouponStatus";
import { CouponActions } from "../CouponActions/CouponActions";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatDiscount = (coupon) => {
  if (coupon.discountType === "percentage") {
    return `${coupon.discountValue}% off`;
  }
  return `${formatPaise(coupon.discountValue)} off`;
};

const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export const CouponRow = ({ coupon }) => {
  const usageCount = coupon.usageCount ?? coupon.usedCount ?? 0;
  const expiryDate = coupon.expiryDate ?? coupon.validUntil;

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
      <td className="p-3">
        <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
          {coupon.code}
        </p>
        {coupon.minOrderValue > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Min. order {formatPaise(coupon.minOrderValue)}
          </p>
        )}
      </td>
      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
        {formatDiscount(coupon)}
      </td>
      <td className="p-3 text-sm text-gray-700 dark:text-gray-300">
        {formatDate(expiryDate)}
      </td>
      <td className="p-3">
        <CouponUsage usageCount={usageCount} usageLimit={coupon.usageLimit} />
      </td>
      <td className="p-3">
        <CouponStatus
          couponId={coupon._id}
          isActive={coupon.isActive}
          expiryDate={expiryDate}
        />
      </td>
      <td className="p-3">
        <CouponActions couponId={coupon._id} />
      </td>
    </tr>
  );
};

export default CouponRow;
