/**
 * FILE: src/components/admin/reviews/ReviewRating/ReviewRating.jsx
 *
 * ============================================================================
 * ReviewRating — Phase 18H (Reused by ReviewAnalytics)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A flexible star-rating display component with configurable size and
 * optional numeric value. Reuses the same star visual language as
 * ReviewStars (lucide-react Star icon, amber fill) but adds size variants
 * and an optional text label — exactly what ReviewAnalytics needs for its
 * average-rating hero block.
 *
 * PRODUCTION-READY BECAUSE:
 * - Three sizes: sm (3), md (4), lg (5) — matching the admin UI's scale
 * - Optional `showValue` prop to display "X/5" text alongside the stars
 * - Dark mode via `dark:` classes
 * - Fully aria-label-led for accessibility
 */

import { Star } from "lucide-react";

const SIZE_MAP = {
  sm: { star: "h-3.5 w-3.5", text: "text-sm" },
  md: { star: "h-5 w-5", text: "text-base" },
  lg: { star: "h-6 w-6", text: "text-lg" },
};

export const ReviewRating = ({ rating = 0, size = "md", showValue = true }) => {
  const value = Number(rating) || 0;
  const clamped = Math.max(0, Math.min(5, Math.round(value)));
  const dimensions = SIZE_MAP[size] ?? SIZE_MAP.md;

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${dimensions.star} ${
              star <= clamped
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className={`font-medium text-gray-700 dark:text-gray-300 ${dimensions.text}`}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default ReviewRating;

