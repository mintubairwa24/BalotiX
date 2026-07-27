/**
 * FILE: src/components/admin/analytics/ReviewAnalytics/ReviewAnalytics.jsx
 *
 * ============================================================================
 * ReviewAnalytics — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * An average-rating + distribution widget, per "Review analytics."
 * FLAGGED — consumes useReviewAnalytics() → GET /analytics/reviews (see
 * analytics.service.js's header for why this is a genuine new backend
 * aggregate, deliberately NOT computed client-side from Phase 18G's
 * paginated review list — a distribution needs to span ALL reviews, and
 * partial-page math would be actively misleading, not just incomplete).
 *
 * REUSES: `ReviewRating` from Phase 18G for the average-rating display —
 * same star visual language an admin already sees on the Reviews page,
 * rather than a second star-rendering implementation.
 *
 * PRODUCTION-READY BECAUSE:
 * - AnalyticsSkeleton("list") while loading, distinct unavailable-vs-empty
 *   states (`retry: false` in the hook, same reasoning as PaymentAnalytics)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { MessageSquare } from "lucide-react";
import { useReviewAnalytics } from "../../../../hooks/useAnalytics";
import { AnalyticsSkeleton } from "../AnalyticsSkeleton/AnalyticsSkeleton";
import { ReviewRating } from "../../reviews/ReviewRating";

export const ReviewAnalytics = () => {
  const { averageRating, ratingDistribution, isLoading, isError } = useReviewAnalytics();

  const maxCount = Math.max(1, ...ratingDistribution.map((r) => r.count));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Review Analytics</h2>

      {isLoading && <AnalyticsSkeleton variant="list" rows={5} />}

      {!isLoading && isError && (
        <p className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <MessageSquare className="h-4 w-4" />
          Review analytics isn't available yet.
        </p>
      )}

      {!isLoading && !isError && ratingDistribution.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No reviews in this period.</p>
      )}

      {!isLoading && !isError && ratingDistribution.length > 0 && (
        <div className="space-y-4">
          {averageRating !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {averageRating.toFixed(1)}
              </span>
              <ReviewRating rating={Math.round(averageRating)} size="md" showValue={false} />
            </div>
          )}

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const entry = ratingDistribution.find((r) => r.rating === star);
              const count = entry?.count ?? 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-8 shrink-0 text-gray-500 dark:text-gray-400">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-gray-500 dark:text-gray-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewAnalytics;