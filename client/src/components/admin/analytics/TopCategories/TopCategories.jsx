/**
 * FILE: src/components/admin/analytics/TopCategories/TopCategories.jsx
 *
 * ============================================================================
 * TopCategories — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A ranked list of best-performing categories by revenue/units sold, per
 * "Category analytics." Sibling of TopProducts — same list shape, same
 * "link into existing management screen" pattern, this time into Phase
 * 18B/18D's Category Management edit page.
 *
 * BACKEND COMMUNICATION:
 * useTopCategories() → analytics.service.js#getTopCategories →
 * GET /analytics/top-categories — a pre-ranked list.
 *
 * MONEY HANDLING (Convention #1): `revenue` per category arrives in
 * PAISE, formatted only.
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsSkeleton("list") while loading, AnalyticsEmpty on error/empty
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
import { useTopCategories } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const TopCategories = () => {
  const { categories, isLoading, isError } = useTopCategories(5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Top Categories</h2>

      {isLoading && <AnalyticsSkeleton variant="list" rows={5} />}
      {!isLoading && isError && <AnalyticsEmpty message="Couldn't load top categories." />}
      {!isLoading && !isError && categories.length === 0 && (
        <AnalyticsEmpty message="No category sales in this period." />
      )}

      {!isLoading && !isError && categories.length > 0 && (
        <ol className="space-y-3">
          {categories.map((category, i) => (
            <li key={category._id} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">
                {i + 1}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-950 dark:text-indigo-400">
                <Folder className="h-4 w-4" />
              </div>
              <Link
                to={`/admin/categories/${category._id}/edit`}
                className="min-w-0 flex-1 truncate text-sm text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              >
                {category.name}
              </Link>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatPaise(category.revenue)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{category.unitsSold} sold</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default TopCategories;