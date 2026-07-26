/**
 * FILE: src/hooks/useAdminDashboard.js
 *
 * ============================================================================
 * src/hooks/useAdminDashboard.js
 * useAdminDashboard — Phase 17 (Admin Dashboard Integration)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The React Query layer between the pure-Axios service files
 * (analytics.service.js, admin.service.js) and the dashboard components.
 * Owns: cache keys, `response.data.data` unwrapping, stale/refetch config,
 * and error normalization — so components never touch Axios directly.
 *
 * BACKEND COMMUNICATION:
 * - useDashboardStats() → calls analytics.service.js#getDashboardStats()
 *   → GET /analytics/dashboard → { totalRevenue, totalOrders, totalUsers,
 *     totalProducts, *ChangePercent? }
 * - useRecentActivity(limit) → calls admin.service.js#getRecentActivity(limit)
 *   → GET /admin/activity?limit= → { activities: [...] }
 *
 * REUSES:
 * Nothing structurally new here — follows the exact useNotifications.js
 * (Phase 16) pattern: plain useQuery calls, query keys as arrays, no
 * mutations needed in this phase (dashboard is read-only).
 *
 * CACHING STRATEGY:
 * - staleTime of 60s on both queries: dashboard numbers don't need to be
 *   real-time-fresh on every render, and this avoids hammering the backend
 *   if the admin flips between tabs. A manual refetch is exposed via the
 *   returned `refetch` for a "Refresh" affordance if a future phase wants one.
 * - refetchOnWindowFocus left at React Query default (true) — reasonable for
 *   an admin glancing back at the dashboard tab.
 *
 * PRODUCTION-READY BECAUSE:
 * - Components receive already-unwrapped, already-shaped data + clean
 *   isLoading/isError/error flags — no Axios or response.data.data leakage
 *   past this boundary (Architectural Convention #3)
 * - Query keys are namespaced ("admin", "dashboard", ...) to avoid cache
 *   collisions with any other feature's queries
 * - No business logic / calculations here — this hook is a pure data-shape
 *   adapter, consistent with every other hook in the project
 */

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/analytics.service";
import { getRecentActivity } from "../services/admin.service";

/**
 * Fetches summary stats for the DashboardStats cards.
 * Numbers only — no chart/time-series data (out of scope for Phase 17).
 */
export const useDashboardStats = () => {
  const query = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: async () => {
      const response = await getDashboardStats();
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });

  return {
    stats: query.data, // { totalRevenue, totalOrders, totalUsers, totalProducts, ...deltas }
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches recent activity for the RecentActivity feed.
 * @param {number} limit - defaults to 10, matching a typical dashboard feed length
 */
export const useRecentActivity = (limit = 10) => {
  const query = useQuery({
    queryKey: ["admin", "dashboard", "activity", limit],
    queryFn: async () => {
      const response = await getRecentActivity(limit);
      return response.data.data.activities;
    },
    staleTime: 60 * 1000,
  });

  return {
    activities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
