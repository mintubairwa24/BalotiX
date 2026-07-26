/**
 * FILE: src/pages/admin/coupons/CouponsPage.jsx
 *
 * ============================================================================
 * CouponsPage — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/coupons route (rendered inside AdminLayout's <Outlet />,
 * Phase 17). Composes CouponSearch + CouponFilters in a toolbar row and
 * CouponsTable, which itself mounts DeleteCouponModal. Exact sibling of
 * ProductsPage/CategoriesPage.
 *
 * AUTHORIZATION (Convention: reuse the existing auth system):
 * Same role-check pattern duplicated across every admin page since Phase
 * 17 (`user.role === "admin"` via useAuthStore) — now duplicated across
 * thirteen admin pages total. The case for extracting a shared
 * <AdminRoute> guard is now about as strong as it will get; still flagged
 * rather than done here since it's routing infrastructure outside this
 * phase's file list.
 *
 * PRODUCTION-READY BECAUSE:
 * - "Create Coupon" CTA is always reachable from the list
 * - Toolbar (search + filters) wraps responsively on narrow admin viewports
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuthStore } from "../../../store";
import { CouponSearch } from "../../../components/admin/coupons/CouponSearch/CouponSearch";
import { CouponFilters } from "../../../components/admin/coupons/CouponFilters/CouponFilters";
import { CouponsTable } from "../../../components/admin/coupons/CouponsTable/CouponsTable";

const CouponsPage = () => {
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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Coupons
        </h1>
        <Link
          to="/admin/coupons/create"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CouponSearch />
        <CouponFilters />
      </div>

      <CouponsTable />
    </div>
  );
};

export default CouponsPage;