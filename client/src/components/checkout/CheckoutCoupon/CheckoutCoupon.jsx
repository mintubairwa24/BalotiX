/**
 * src/components/checkout/CheckoutCoupon/CheckoutCoupon.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Thin wrapper that surfaces coupon state during checkout review using
 * EXISTING Phase 10 components — no coupon logic is reimplemented here.
 * 
 * REUSE, NOT DUPLICATION:
 * - CouponSummary (Phase 10) — shown if cart.appliedCoupon exists
 * - CouponForm (Phase 10) — shown if no coupon applied yet, letting the
 *   user apply one without leaving checkout
 * - useRemoveCouponMutation, isCouponApplied (Phase 10, useCoupon.js)
 * 
 * WHY THIS EXISTS SEPARATELY FROM CartSummary:
 * CartSummary (Phase 9) already embeds coupon UI for the Cart page.
 * CheckoutPage uses a different layout (dedicated address/items/coupon
 * sections stacked vertically) rather than a single combined summary
 * card, so this wrapper places the SAME underlying coupon components
 * into the checkout-specific layout without touching CartSummary itself.
 * 
 * Props:
 * - cart: cart object from useCartQuery (Phase 9), needed to read
 *   cart.appliedCoupon
 */

import { CouponSummary } from "../../coupon/CouponSummary/CouponSummary";
import { CouponForm } from "../../coupon/CouponForm/CouponForm";
import { useRemoveCouponMutation, isCouponApplied } from "../../../hooks/useCoupon";
import { useCouponStore } from "../../../store/coupon.store";

export const CheckoutCoupon = ({ cart }) => {
  const { mutate: removeCoupon, isPending: isRemoving } =
    useRemoveCouponMutation();
  const { isCouponFormOpen, openCouponForm } = useCouponStore();

  const hasCoupon = isCouponApplied(cart);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Coupon
      </h3>

      {/* Applied coupon — reused from Phase 10 */}
      {hasCoupon && (
        <CouponSummary
          coupon={cart.appliedCoupon}
          onRemove={() => removeCoupon()}
          isRemoving={isRemoving}
        />
      )}

      {/* No coupon applied — offer to apply one, reused from Phase 10 */}
      {!hasCoupon && !isCouponFormOpen && (
        <button
          onClick={() => openCouponForm()}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Have a coupon? Apply it here
        </button>
      )}

      {!hasCoupon && isCouponFormOpen && <CouponForm />}
    </div>
  );
};