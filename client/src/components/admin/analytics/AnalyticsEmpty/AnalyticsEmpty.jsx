/**
 * FILE: src/components/admin/analytics/AnalyticsEmpty/AnalyticsEmpty.jsx
 *
 * ============================================================================
 * AnalyticsEmpty — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * ONE shared empty-state component for any chart/list in this phase that
 * comes back with no data for the selected date range — same
 * one-shared-component reasoning as AnalyticsSkeleton. Unlike a table's
 * empty state (which distinguishes "no results" from "nothing exists
 * yet"), an analytics empty state has one honest message: no activity
 * happened in the selected period. There's no "clear filters" action
 * here — the fix is picking a different date range via DateRangeFilter,
 * which is already visible elsewhere on the page, not a button this
 * component needs to own.
 *
 * PRODUCTION-READY BECAUSE:
 * - Accepts a `message` override so each consumer (TopProducts,
 *   PaymentAnalytics, etc.) can be specific ("No sales in this period"
 *   vs. "No reviews in this period") without needing separate components
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { BarChart3 } from "lucide-react";

const AnalyticsEmpty = ({ message = "No data for the selected date range." }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
    <BarChart3 className="h-8 w-8 text-gray-300 dark:text-gray-600" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

export default AnalyticsEmpty;