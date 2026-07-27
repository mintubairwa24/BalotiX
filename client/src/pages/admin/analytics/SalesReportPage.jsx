/**
 * FILE: src/pages/admin/analytics/SalesReportPage.jsx
 *
 * ============================================================================
 * SalesReportPage — Phase 18H
 * ============================================================================
 *
 * WHY THIS IS A SEPARATE PAGE FROM AnalyticsDashboard (not a duplicate):
 * AnalyticsDashboard is a broad overview touching every domain (revenue,
 * orders, customers, inventory, coupons, payments, reviews). This page is
 * a focused SALES report — an admin who specifically wants to dig into
 * "how is revenue doing and what's driving it" gets a page with only the
 * relevant pieces (RevenueCard, SalesChart, TopProducts, TopCategories),
 * without the unrelated inventory/payment/review widgets competing for
 * space. Both pages share the SAME analytics.store.js date range and the
 * SAME useAnalytics.js hooks — this is a different composition/emphasis
 * of already-built pieces, not new data-fetching logic.
 *
 * WHY THIS REUSES RevenueCard/SalesChart/TopProducts/TopCategories
 * DIRECTLY (not new report-specific versions): per Convention #11, reuse
 * over duplication — these four components already do exactly what a
 * sales report needs; building parallel "report" versions of the same
 * widgets would be pure duplication for no functional gain.
 *
 * AUTHORIZATION:
 * Same role-check pattern as AnalyticsDashboard and every other admin page.
 *
 * PRODUCTION-READY BECAUSE:
 * - Breadcrumb-style back link to the main Analytics dashboard
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, FileDown } from "lucide-react";
import { useAuthStore } from "../../../store";
import { exportToPDF } from "../../../utils/exportToPDF";
import { AnalyticsFilters } from "../../../components/admin/analytics/AnalyticsFilters/AnalyticsFilters";
import { RevenueCard } from "../../../components/admin/analytics/RevenueCard/RevenueCard";
import { SalesChart } from "../../../components/admin/analytics/SalesChart/SalesChart";
import { TopProducts } from "../../../components/admin/analytics/TopProducts/TopProducts";
import { TopCategories } from "../../../components/admin/analytics/TopCategories/TopCategories";

const SalesReportPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const reportRef = useRef(null);
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
    await exportToPDF(reportRef, "Sales-Report", "Sales Report");
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
        <div>
          <Link
            to="/admin/analytics"
            className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Analytics
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Sales Report</h1>
        </div>
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

      <div ref={reportRef} className="space-y-5">
        <RevenueCard />

        <SalesChart />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TopProducts />
          <TopCategories />
        </div>
      </div>
    </div>
  );
};

export default SalesReportPage;