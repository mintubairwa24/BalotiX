/**
 * FILE: src/pages/admin/coupons/EditCouponPage.jsx
 *
 * ============================================================================
 * EditCouponPage — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/coupons/:id/edit route. Fetches the coupon being edited, then
 * renders <CouponForm mode="edit" initialCoupon={coupon} />.
 *
 * WHY THIS USES useAdminCouponDetail, NOT A REUSED CUSTOMER-FACING HOOK
 * (unlike EditProductPage/EditCategoryPage): coupons have no customer-
 * facing detail page to reuse a hook from — customers only validate a
 * coupon code at checkout (Phase 10), they never browse to a coupon
 * detail URL. So this phase adds a genuinely new, admin-only
 * useAdminCouponDetail() (see useAdminCoupons.js and admin.service.js's
 * getAdminCouponById for the full reasoning) rather than reusing
 * something that doesn't exist. This also means the "inactive/expired
 * item 404s on a customer-scoped endpoint" risk flagged for
 * EditProductPage/EditCategoryPage does NOT apply here — this endpoint
 * was always admin-only, so there's no customer-facing filtering to
 * accidentally inherit.
 *
 * PRODUCTION-READY BECAUSE:
 * - Distinguishes loading / error / success states explicitly
 *   (Convention #7 — never fail silently)
 * - CouponForm only mounts once real coupon data is available, so its
 *   internal `useState` initializers never see stale/undefined values
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store";
import { useAdminCouponDetail } from "../../../hooks/useAdminCoupons";
import { CouponForm } from "../../../components/admin/coupons/CouponForm/CouponForm";

const EditCouponPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      setBlocked(true);
      const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user, isAdmin, navigate]);

  const { coupon, isLoading, isError } = useAdminCouponDetail(id);

  if (isAuthLoading) return null;
  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting…
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/admin/coupons"
          className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Coupons
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Edit Coupon
        </h1>
      </div>

      {isLoading && (
        <div className="max-w-2xl space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          Couldn't load this coupon. It may have been deleted, or you can
          try again from the Coupons list.
        </div>
      )}

      {!isLoading && !isError && coupon && (
        <CouponForm mode="edit" initialCoupon={coupon} />
      )}
    </div>
  );
};

export default EditCouponPage;