/**
 * FILE: src/components/admin/coupons/CouponFilters/CouponFilters.jsx
 *
 * ============================================================================
 * CouponFilters — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A status dropdown narrowing the admin coupon table via
 * adminCoupons.store.js's `status` field, which useAdminCouponsList()
 * reads directly. Simpler than ProductFilters/CategoryFilters/UserFilters
 * (no second dependent dropdown) since coupons have no category/parent/
 * role-style secondary dimension in the assumed schema — just status.
 *
 * WHY "Expired" IS INCLUDED, FLAGGED:
 * `isActive` (a stored boolean) and "expired" (a coupon whose `expiryDate`
 * has passed) are two DIFFERENT concepts — a coupon can be `isActive: true`
 * in the database but still functionally unusable because it's past its
 * expiry date. Whether the backend's `status` filter param actually
 * distinguishes "expired" as its own queryable value (vs. this frontend
 * needing to compute it by comparing `expiryDate` to `now`) is NOT
 * confirmed. This filter sends "expired" as a status value and trusts the
 * backend to interpret it — if the backend doesn't support that value, it
 * will simply be ignored/error per normal query-param handling, and the
 * fix is confined to this one option, not a wider client-side date-math
 * reimplementation (which would risk drifting from backend expiry logic).
 *
 * PRODUCTION-READY BECAUSE:
 * - Every change goes through the store's setter, which already resets
 *   `page` to 1
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useAdminCouponsStore } from "../../../../store/adminCoupons.store";

export const CouponFilters = () => {
  const status = useAdminCouponsStore((s) => s.status);
  const setStatus = useAdminCouponsStore((s) => s.setStatus);

  return (
    <select
      value={status}
      onChange={(e) => setStatus(e.target.value)}
      aria-label="Filter by status"
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
    >
      <option value="">All Statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="expired">Expired</option>
    </select>
  );
};

export default CouponFilters;
