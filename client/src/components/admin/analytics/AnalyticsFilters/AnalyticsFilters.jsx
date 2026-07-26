/**
 * FILE: src/components/admin/analytics/AnalyticsFilters/AnalyticsFilters.jsx
 *
 * ============================================================================
 * AnalyticsFilters — Phase 18H
 * ============================================================================
 *
 * WHY THIS IS A SEPARATE FILE FROM DateRangeFilter (not just using
 * DateRangeFilter directly in the pages): this is the toolbar-level
 * composition point for ALL analytics-wide filters — today that's only
 * DateRangeFilter, but this file is where a future filter (e.g. "compare
 * to previous period," a granularity toggle) would be added without
 * AnalyticsDashboard.jsx itself needing to change. Same "page composes a
 * toolbar component, toolbar composes individual filter controls" pattern
 * as ProductFilters/CategoryFilters/UserFilters wrapping their own
 * individual `<select>`s — the difference here is DateRangeFilter is
 * substantial enough to be its own file (unlike a plain `<select>`), so
 * this toolbar currently wraps just the one thing.
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsDashboard/SalesReportPage each render one
 *   `<AnalyticsFilters />` instead of needing to know DateRangeFilter
 *   exists directly — an implementation detail encapsulated here
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { DateRangeFilter } from "../DateRangeFilter/DateRangeFilter";

const AnalyticsFilters = () => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Date Range
      </span>
      <DateRangeFilter />
    </div>
  );
};

export default AnalyticsFilters;