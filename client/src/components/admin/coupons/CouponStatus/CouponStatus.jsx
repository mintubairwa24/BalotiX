/**
 * FILE: src/components/admin/coupons/CouponStatus/CouponStatus.jsx
 *
 * ============================================================================
 * CouponStatus — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a coupon's status as a colored badge, AND (per the brief's
 * "Status management") doubles as the clickable control that flips
 * `isActive` — via useToggleCouponStatus(), hitting the dedicated PATCH
 * /coupons/:id/status endpoint. Same clickable-toggle-badge pattern as
 * ProductStatus/CategoryStatus (Phase 18A/18B) — NOT the display-only
 * pattern used for UserStatus (Phase 18C), because toggling a coupon's
 * active flag has no account-lockout-style consequence for a person the
 * way suspending a user does; it's closer in risk profile to
 * deactivating a product listing.
 *
 * WHY "EXPIRED" IS SHOWN SEPARATELY FROM "Inactive" (and is NOT clickable):
 * `isActive` and expiry are different concepts (see CouponFilters' header
 * for the same distinction on the filter side). A coupon past its
 * `expiryDate` is functionally dead regardless of `isActive` — showing it
 * as merely "Inactive" would incorrectly imply an admin could reactivate
 * it back to usability with one click, when in reality nothing this
 * button does changes whether the expiry date has passed. So: if
 * `expiryDate` is in the past, the badge shows "Expired" and is NOT a
 * button (no toggle possible) — otherwise it shows the normal clickable
 * Active/Inactive toggle. This is pure date comparison for DISPLAY
 * purposes only, not a reimplementation of the backend's actual
 * expiry-enforcement logic (which governs whether the coupon is
 * REDEEMABLE at checkout, not what this badge shows).
 *
 * PRODUCTION-READY BECAUSE:
 * - Click target is a real <button> when clickable, keyboard/screen-reader
 *   accessible
 * - Disabled while its own mutation is pending
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Loader2 } from "lucide-react";
import { useToggleCouponStatus } from "../../../../hooks/useAdminCoupons";

export const CouponStatus = ({ couponId, isActive, expiryDate, validUntil }) => {
  const { mutate: toggleStatus, isPending } = useToggleCouponStatus();

  const resolvedExpiry = expiryDate ?? validUntil;
  const isExpired = resolvedExpiry && new Date(resolvedExpiry) < new Date();

  if (isExpired) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        Expired
      </span>
    );
  }

  return (
    <button
      onClick={() => toggleStatus({ id: couponId, isActive: !isActive })}
      disabled={isPending}
      aria-label={isActive ? "Deactivate coupon" : "Activate coupon"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive
          ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
      }`}
    >
      {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      {isActive ? "Active" : "Inactive"}
    </button>
  );
};

export default CouponStatus;
