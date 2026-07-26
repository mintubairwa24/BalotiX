/**
 * ============================================================================
 * src/components/admin/AdminSkeleton/AdminSkeleton.jsx
 * AdminSkeleton — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Loading-state component for the admin dashboard, mirroring the exact
 * pattern established by AccountSkeleton (Phase 15) — a single component
 * with a `variant` prop rather than N separate skeleton files, since all
 * variants share the same shimmer/pulse visual language.
 *
 * WHY MULTIPLE VARIANTS (not one generic box):
 * Different dashboard regions load independently (DashboardStats and
 * RecentActivity are separate useQuery calls with separate isLoading
 * flags) — each needs a skeleton shaped like ITS eventual content so there
 * is no layout shift when real data arrives (Architectural Convention #7).
 *
 * VARIANTS:
 * - "stats"    → 4 stat-card placeholders (grid, matches DashboardStats)
 * - "activity" → N stacked list-row placeholders (matches RecentActivity)
 * - "page"     → stats + activity + quick-actions combined, for the very
 *                first paint of AdminDashboardPage before ANY data is in
 *
 * REUSES:
 * Tailwind `animate-pulse` + `dark:` classes — same shimmer technique as
 * every other skeleton in the project (CartSkeleton, ProductSkeleton, etc.)
 * No new dependency introduced.
 *
 * PRODUCTION-READY BECAUSE:
 * - Dimensions approximate the real components closely enough that content
 *   doesn't jump when swapped in (CLS-friendly)
 * - Dark mode supported via `dark:` variants (Convention #6)
 * - `count` prop on the "activity" variant lets RecentActivity's skeleton
 *   match whatever `limit` was requested, instead of a hardcoded number
 */

const StatCardSkeleton = () => (
  <div
    className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    aria-hidden="true"
  >
    <div className="mb-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mb-2 h-7 w-32 rounded bg-gray-300 dark:bg-gray-600" />
    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

const ActivityRowSkeleton = () => (
  <div
    className="flex animate-pulse items-center gap-3 border-b border-gray-100 py-3 last:border-0 dark:border-gray-700"
    aria-hidden="true"
  >
    <div className="h-9 w-9 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
    <div className="flex-1">
      <div className="mb-2 h-3.5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-1/4 rounded bg-gray-100 dark:bg-gray-800" />
    </div>
  </div>
);

export const AdminSkeleton = ({ variant = "page", count = 5 }) => {
  if (variant === "stats") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (variant === "activity") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {Array.from({ length: count }).map((_, i) => (
          <ActivityRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  // "page" — combined first-paint skeleton
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="animate-pulse h-6 w-56 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <ActivityRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default AdminSkeleton;