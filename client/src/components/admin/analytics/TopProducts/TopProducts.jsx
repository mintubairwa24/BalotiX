/**
 * FILE: src/components/admin/analytics/TopProducts/TopProducts.jsx
 *
 * ============================================================================
 * TopProducts — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A ranked list of best-selling products by units sold/revenue, per
 * "Product analytics." Links each product to its Phase 18A admin edit
 * page, same "analytics is a navigational bridge into existing management
 * screens" pattern established by ReviewProductInfo (Phase 18G).
 *
 * BACKEND COMMUNICATION:
 * useTopProducts() → analytics.service.js#getTopProducts →
 * GET /analytics/top-products — a pre-ranked list; this component does
 * NOT sort or rank products itself, only renders the order the backend
 * already determined.
 *
 * MONEY HANDLING (Convention #1): `revenue` per product arrives in PAISE,
 * formatted only.
 *
 * PRODUCTION-READY BECAUSE:
 * - Falls back to a placeholder icon for products with no image, same
 *   pattern as ProductRow (Phase 18A)
 * - AnalyticsSkeleton("list") while loading, AnalyticsEmpty on error/empty
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { useTopProducts } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { AnalyticsEmpty } from "../AnalyticsEmpty/AnalyticsEmpty";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const TopProducts = () => {
  const { products, isLoading, isError } = useTopProducts(5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Top Products</h2>

      {isLoading && <AnalyticsSkeleton variant="list" rows={5} />}
      {!isLoading && isError && <AnalyticsEmpty message="Couldn't load top products." />}
      {!isLoading && !isError && products.length === 0 && (
        <AnalyticsEmpty message="No product sales in this period." />
      )}

      {!isLoading && !isError && products.length > 0 && (
        <ol className="space-y-3">
          {products.map((product, i) => (
            <li key={product._id} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">
                {i + 1}
              </span>
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-9 w-9 rounded-lg border border-gray-200 object-cover dark:border-gray-700" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300 dark:border-gray-600 dark:text-gray-600">
                  <ImageOff className="h-4 w-4" />
                </div>
              )}
              <Link
                to={`/admin/products/${product._id}/edit`}
                className="min-w-0 flex-1 truncate text-sm text-gray-700 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
              >
                {product.name}
              </Link>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatPaise(product.revenue)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{product.unitsSold} sold</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default TopProducts;