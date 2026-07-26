/**
 * FILE: src/components/admin/analytics/AnalyticsSkeleton/AnalyticsSkeleton.jsx
 *
 * ============================================================================
 * AnalyticsSkeleton — Phase 18H
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * ONE shared skeleton component for every card/chart/list in this phase,
 * with variants — rather than each of the sixteen components in this
 * phase building its own bespoke shimmer markup. This is a step further
 * than prior phases' per-feature skeletons (ProductsSkeleton,
 * UserSkeleton, etc.) because analytics components are visually much more
 * uniform (a card is a card, a chart-shaped box is a chart-shaped box)
 * than a table row versus a detail card — one shared component with
 * variants avoids fifteen nearly-identical files.
 *
 * VARIANTS:
 * - "card"  → a stat-card placeholder (DashboardCards, RevenueCard)
 * - "chart" → a large rectangular placeholder (SalesChart, OrdersChart,
 *             CustomerGrowthChart)
 * - "list"  → stacked row placeholders (TopProducts, TopCategories,
 *             CouponAnalytics, RecentActivity)
 *
 * PRODUCTION-READY BECAUSE:
 * - `rows`/`count` props let list/card variants match their real content's
 *   eventual item count, avoiding layout jump
 * - Dark mode via `dark:` classes (Convention #6)
 */

const CardSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800" aria-hidden="true">
    <div className="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mb-2 h-7 w-32 rounded bg-gray-300 dark:bg-gray-600" />
    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800" aria-hidden="true">
    <div className="mb-4 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-64 rounded-lg bg-gray-100 dark:bg-gray-700" />
  </div>
);

const ListSkeleton = ({ rows = 5 }) => (
  <div className="animate-pulse space-y-3" aria-hidden="true">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="mb-1.5 h-3.5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-1/3 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
    ))}
  </div>
);

const AnalyticsSkeleton = ({ variant = "card", rows = 5 }) => {
  if (variant === "chart") return <ChartSkeleton />;
  if (variant === "list") return <ListSkeleton rows={rows} />;
  return <CardSkeleton />;
};

export default AnalyticsSkeleton;