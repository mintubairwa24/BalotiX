/**
 * FILE: src/components/admin/coupons/CouponActions/CouponActions.jsx
 *
 * ============================================================================
 * CouponActions — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The Edit / Delete icon-button pair rendered at the end of each
 * CouponRow. Exact sibling of ProductActions/CategoryActions — kept
 * separate from CouponRow so the row stays a simple, mostly-presentational
 * layout component.
 *
 * WHY DELETE DOESN'T DELETE DIRECTLY:
 * Clicking Delete only calls `openDeleteModal(couponId)` on
 * adminCoupons.store.js — it does NOT call useDeleteCoupon() itself. The
 * actual destructive mutation lives in DeleteCouponModal, the single
 * confirmation gate for every delete in this feature. Same "store holds
 * WHICH item, modal owns the actual mutation" pattern used across every
 * admin CRUD feature in this project.
 *
 * PRODUCTION-READY BECAUSE:
 * - Edit is a real <Link> (proper navigation, browser back/forward,
 *   ctrl/cmd-click opens new tab) rather than a button + programmatic
 *   navigate()
 * - Icon-only buttons carry `aria-label`s for screen readers
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useAdminCouponsStore } from "../../../../store/adminCoupons.store";

export const CouponActions = ({ couponId }) => {
  const openDeleteModal = useAdminCouponsStore((s) => s.openDeleteModal);

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to={`/admin/coupons/${couponId}/edit`}
        aria-label="Edit coupon"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-indigo-400"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={() => openDeleteModal(couponId)}
        aria-label="Delete coupon"
        className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CouponActions;
