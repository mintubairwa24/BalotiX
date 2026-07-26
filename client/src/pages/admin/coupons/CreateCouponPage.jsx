/**
 * FILE: src/pages/admin/coupons/CreateCouponPage.jsx
 *
 * ============================================================================
 * CreateCouponPage — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/coupons/create route. A thin shell (Convention #3) that does
 * the role-gate check (see CouponsPage.jsx's header), then renders
 * <CouponForm mode="create" /> with no `initialCoupon` — CouponForm
 * handles everything else, including which mutation (useCreateCoupon)
 * fires on submit.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero duplicated form logic — CouponForm is the single implementation
 *   shared with EditCouponPage
 * - Breadcrumb-style back link keeps the admin oriented within the
 *   Coupons section
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "../../../store";
import { CouponForm } from "../../../components/admin/coupons/CouponForm/CouponForm";

const CreateCouponPage = () => {
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
          Create Coupon
        </h1>
      </div>

      <CouponForm mode="create" />
    </div>
  );
};

export default CreateCouponPage;