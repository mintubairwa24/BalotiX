/**
 * ============================================================================
 * src/components/admin/DashboardOverview/DashboardOverview.jsx
 * DashboardOverview — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the dashboard's content. This is the ONE place
 * that calls useDashboardStats() and useRecentActivity() — DashboardStats
 * and RecentActivity themselves stay purely presentational (receive data +
 * loading/error state as props). This mirrors the project's page-vs-
 * component split (Convention #3: pages are thin shells that fetch via
 * hooks and delegate to components) even though this is a component, not
 * a page — AdminDashboardPage.jsx delegates straight to this component,
 * which does the actual composing.
 *
 * COMPOSES:
 * AdminWelcome (Phase 15 reuse) + DashboardStats + RecentActivity +
 * QuickActions — the full "shell + overview" scope of Phase 17.
 *
 * WHY FETCHING LIVES HERE, NOT IN THE PAGE:
 * AdminDashboardPage.jsx owns the role-based access guard (redirect logic)
 * — mixing data-fetching into that file would conflate "can this user see
 * this page" with "what does this page show." Keeping DashboardOverview as
 * the fetch+compose boundary means the page stays a true thin shell.
 *
 * PRODUCTION-READY BECAUSE:
 * - Single fetch per query (React Query dedupes/caches under the hood
 *   regardless, but there's no reason to call these hooks in multiple
 *   places)
 * - Passes isLoading/isError/retry down explicitly rather than each child
 *   re-deriving it — one source of truth per query result
 */

import { useDashboardStats, useRecentActivity } from "../../../hooks/useAdminDashboard";
import { AdminWelcome } from "../AdminWelcome/AdminWelcome";
import { DashboardStats } from "../DashboardStats/DashboardStats";
import { RecentActivity } from "../RecentActivity/RecentActivity";
import { QuickActions } from "../QuickActions/QuickActions";

export const DashboardOverview = () => {
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDashboardStats();

  const {
    activities,
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useRecentActivity(10);

  return (
    <div className="space-y-6">
      <AdminWelcome />

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Overview
        </h2>
        <DashboardStats
          stats={stats}
          isLoading={statsLoading}
          isError={statsError}
          onRetry={refetchStats}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Recent Activity
        </h2>
        <RecentActivity
          activities={activities}
          isLoading={activityLoading}
          isError={activityError}
          onRetry={refetchActivity}
        />
      </section>

      <section>
        <QuickActions />
      </section>
    </div>
  );
};

export default DashboardOverview;