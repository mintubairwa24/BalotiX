/**
 * FILE: src/components/admin/analytics/InventoryInsights/InventoryInsights.jsx
 *
 * ============================================================================
 * InventoryInsights — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A compact "what needs attention in stock" widget, per "Inventory
 * analytics." This is the clearest example in this phase of "reuse
 * existing backend APIs exactly" — rather than inventing a new
 * /analytics/inventory endpoint, this reuses Phase 18F's ALREADY-BUILT
 * getAdminInventory (via useInventoryInsights() in useAnalytics.js),
 * which already returns a `summary` (totalItems/lowStockCount/
 * outOfStockCount) alongside a page of items. No new backend surface was
 * needed for this widget at all.
 *
 * WHY LINKING INTO Phase 18F's InventoryPage/InventoryDetailsPage:
 * This widget surfaces the PROBLEM (low/out-of-stock items); Phase 18F's
 * existing screens are where an admin actually ACTS on it (adjusting
 * stock). Same "analytics surfaces, existing management screens act"
 * split as TopProducts/TopCategories linking into Product/Category
 * Management.
 *
 * WHY NO DATE RANGE HERE (unlike most of this phase's other components):
 * Stock levels are a CURRENT snapshot, not a historical trend — filtering
 * "low stock as of 30 days ago" doesn't make sense the way "revenue over
 * the last 30 days" does. useInventoryInsights() deliberately doesn't
 * read the shared date range (see that hook's comment) for this reason.
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsSkeleton("list") while loading, AnalyticsEmpty on error
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { AlertTriangle, XCircle, Package } from "lucide-react";
import { useInventoryInsights } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

export const InventoryInsights = () => {
  const { summary, lowStockItems, isLoading, isError } = useInventoryInsights();

  if (isLoading) return <AnalyticsSkeleton variant="list" rows={4} />;
  if (isError) return <AnalyticsEmpty message="Couldn't load inventory insights." />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Inventory Insights</h2>
        <Link to="/admin/inventory" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400">
          View all
        </Link>
      </div>

      {summary && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950">
            <p className="text-xs text-amber-700 dark:text-amber-400">Low Stock</p>
            <p className="text-lg font-bold text-amber-800 dark:text-amber-300">{summary.lowStockCount}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950">
            <p className="text-xs text-red-700 dark:text-red-400">Out of Stock</p>
            <p className="text-lg font-bold text-red-800 dark:text-red-300">{summary.outOfStockCount}</p>
          </div>
        </div>
      )}

      {lowStockItems.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Package className="h-4 w-4" /> All stock levels look healthy.
        </p>
      ) : (
        <ul className="space-y-2">
          {lowStockItems.slice(0, 4).map((item) => (
            <li key={item.productId} className="flex items-center justify-between text-sm">
              <Link
                to={`/admin/inventory/${item.productId}`}
                className="flex min-w-0 items-center gap-2 truncate text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              >
                {item.status === "out_of_stock" ? (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                )}
                <span className="truncate">{item.productName}</span>
              </Link>
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">{item.currentStock} left</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InventoryInsights;