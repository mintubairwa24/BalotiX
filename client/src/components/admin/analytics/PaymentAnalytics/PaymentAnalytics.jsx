/**
 * FILE: src/components/admin/analytics/PaymentAnalytics/PaymentAnalytics.jsx
 *
 * ============================================================================
 * PaymentAnalytics — Phase 18H
 * ============================================================================
 *
 * WHY THIS IS THE MOST SPECULATIVE COMPONENT IN THIS PHASE (flagged
 * explicitly, per analytics.service.js's header): no admin phase for
 * Payments has been built in this project — Payments exists only as one
 * of the ten backend modules and as the customer-facing Razorpay checkout
 * integration (Phase 13). There is no prior admin-side Payments reference
 * point the way InventoryInsights/CouponAnalytics had Phase 18F/18E to
 * lean on. This component consumes usePaymentAnalytics() → FLAGGED
 * GET /analytics/payments, with `retry: false` in the hook so a missing
 * endpoint fails fast.
 *
 * WHY THIS DEGRADES TO A CLEAR "unavailable" MESSAGE, NOT AN EMPTY CHART:
 * Same distinction StockHistory (Phase 18F) drew between "unavailable"
 * and "empty" — an admin seeing "No payment data" would reasonably think
 * there were simply no payments, when the more likely truth (given no
 * confirmed endpoint) is that this feature doesn't exist yet. This
 * component says so plainly rather than showing a misleading empty state.
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsSkeleton("list") while loading
 * - Distinct unavailable-vs-empty-vs-populated states
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { CreditCard } from "lucide-react";
import { usePaymentAnalytics } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";

const formatPaise = (paise) =>
  `₹${((paise ?? 0) / 100).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const PaymentAnalytics = () => {
  const { byMethod, successRate, isLoading, isError } = usePaymentAnalytics();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Analytics</h2>

      {isLoading && <AnalyticsSkeleton variant="list" rows={3} />}

      {!isLoading && isError && (
        <p className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <CreditCard className="h-4 w-4" />
          Payment analytics isn't available yet.
        </p>
      )}

      {!isLoading && !isError && byMethod.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No payments in this period.</p>
      )}

      {!isLoading && !isError && byMethod.length > 0 && (
        <div className="space-y-3">
          {successRate !== undefined && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Success rate: <span className="font-medium text-gray-900 dark:text-gray-100">{successRate}%</span>
            </p>
          )}
          <ul className="space-y-2">
            {byMethod.map((m) => (
              <li key={m.method} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{m.method}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {m.count} · {formatPaise(m.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaymentAnalytics;