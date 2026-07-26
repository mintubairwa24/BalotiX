/**
 * FILE: src/components/admin/coupons/CouponUsage/CouponUsage.jsx
 *
 * ============================================================================
 * CouponUsage — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Displays a coupon's redemption usage — `usageCount` / `usageLimit` — per
 * the brief's explicit "Coupon usage statistics" feature. Kept as its own
 * component (not inlined in CouponRow) because it's reused in two places:
 * the table row (compact) and, potentially, a future coupon detail view —
 * same "extract once it's needed in more than one place" reasoning used
 * throughout this project (e.g. CategoryProductsCount, Phase 18D).
 *
 * DATA SOURCE (flagged): per admin.service.js's header, `usageCount` is
 * assumed to travel directly on each coupon list item from
 * GET /admin/coupons — NOT from a separate stats endpoint. This component
 * does no fetching of its own; it's purely presentational, receiving
 * `usageCount`/`usageLimit` as props.
 *
 * WHY UNLIMITED COUPONS (no usageLimit) SHOW DIFFERENTLY:
 * A coupon with no usage cap (`usageLimit` null/undefined) has nothing
 * meaningful to show as a fraction or progress bar — "12 / ∞" would be an
 * odd UI. Instead it shows a plain "{count} used" with no limit context,
 * rather than forcing a percentage-of-nothing calculation.
 *
 * PRODUCTION-READY BECAUSE:
 * - Progress bar color shifts to amber near the limit (>=80%) as an
 *   early-warning visual cue, without blocking anything — purely
 *   informational, the backend remains authoritative on whether the
 *   coupon can still be redeemed
 * - Dark mode via `dark:` classes (Convention #6)
 */

export const CouponUsage = ({ usageCount = 0, usageLimit }) => {
  if (usageLimit == null) {
    return (
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {usageCount} used
      </span>
    );
  }

  const percent = Math.min(100, Math.round((usageCount / usageLimit) * 100));
  const isNearLimit = percent >= 80;

  return (
    <div className="w-28">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{usageCount} / {usageLimit}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default CouponUsage;
