/**
 * FILE: src/pages/admin/analytics/AnalyticsDashboard.jsx
 *
 * ============================================================================
 * AnalyticsDashboard — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/analytics route (rendered inside AdminLayout's <Outlet />,
 * Phase 17) — the full analytics overview: AnalyticsFilters (date range),
 * DashboardCards, then a grid of every chart/widget this phase built.
 * Thin shell (Convention #3): role-gate check, then composition — no
 * data-fetching happens directly in this file, each child component owns
 * its own useAnalytics.js hook call.
 *
 * WHY EVERY CHART/WIDGET IS SIMPLY DROPPED INTO A GRID (no per-section
 * fetching orchestration needed here): every component in this phase
 * reads the shared date range from analytics.store.js independently (see
 * that store's header) — this page doesn't need to coordinate loading
 * states or pass any props down, each card manages itself.
 *
 * AUTHORIZATION (Convention: reuse the existing auth system):
 * Same role-check pattern duplicated across every admin page since Phase
 * 17 — now duplicated across sixteen admin pages. Flagged again, not
 * addressed here, consistent with every prior phase's note; this is the
 * strongest recurring signal in the whole project for extracting a
 * shared <AdminRoute> guard.
 *
 * PRODUCTION-READY BECAUSE:
 * - Responsive grid: single column on mobile, two on desktop
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileDown } from "lucide-react";
import { useAuthStore } from "../../../store";
import { exportToPDF } from "../../../utils/exportToPDF";
import { AnalyticsFilters } from "../../../components/admin/analytics/AnalyticsFilters/AnalyticsFilters";
import { DashboardCards } from "../../../components/admin/analytics/DashboardCards/DashboardCards";
import { SalesChart } from "../../../components/admin/analytics/SalesChart/SalesChart";
import { OrdersChart } from "../../../components/admin/analytics/OrdersChart/OrdersChart";
import { CustomerGrowthChart } from "../../../components/admin/analytics/CustomerGrowthChart/CustomerGrowthChart";
import { TopProducts } from "../../../components/admin/analytics/TopProducts/TopProducts";
import { TopCategories } from "../../../components/admin/analytics/TopCategories/TopCategories";
import { InventoryInsights } from "../../../components/admin/analytics/InventoryInsights/InventoryInsights";
import { CouponAnalytics } from "../../../components/admin/analytics/CouponAnalytics/CouponAnalytics";
import { PaymentAnalytics } from "../../../components/admin/analytics/PaymentAnalytics/PaymentAnalytics";
import { ReviewAnalytics } from "../../../components/admin/analytics/ReviewAnalytics/ReviewAnalytics";
import { RecentActivity } from "../../../components/admin/analytics/RecentActivity/RecentActivity";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const dashboardRef = useRef(null);
  const [blocked, setBlocked] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportPDF = async () => {
    setIsExporting(true);
    await exportToPDF(dashboardRef, "Analytics-Report", "Analytics Dashboard");
    setIsExporting(false);
  };

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
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Analytics</h1>
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <FileDown className="h-4 w-4" />
          {isExporting ? "Exporting…" : "Export PDF"}
        </button>
      </div>

      <AnalyticsFilters />

      <div ref={dashboardRef} className="space-y-5">
        <DashboardCards />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SalesChart />
          <OrdersChart />
          <CustomerGrowthChart />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TopProducts />
          <TopCategories />
          <InventoryInsights />
          <CouponAnalytics />
          <PaymentAnalytics />
          <ReviewAnalytics />
        </div>

        <RecentActivity />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;