/**
 * FILE: src/hooks/useAnalytics.js
 *
 * ============================================================================
 * useAnalytics — Phase 18H (Analytics & Reports)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The React Query boundary between the pure-Axios service files
 * (analytics.service.js, admin.service.js) and every analytics component.
 * One hook per data source, all reading the shared date range from
 * analytics.store.js — same "hook derives its own params from a shared
 * store" pattern as every prior admin list hook, just fanning out to many
 * independent queries instead of one list query.
 *
 * BACKEND COMMUNICATION — one hook per analytics.service.js/admin.service.js
 * function, listed in the same order as this phase's components consume
 * them:
 * - useDashboardStats()      → analytics.service.js#getDashboardStats
 * - useSalesAnalytics()      → analytics.service.js#getSalesAnalytics
 * - useOrdersOverview()      → admin.service.js#getAdminOrdersOverview
 * - useCustomerGrowth()      → analytics.service.js#getCustomerGrowth
 * - useTopProducts()         → analytics.service.js#getTopProducts
 * - useTopCategories()       → analytics.service.js#getTopCategories
 * - useInventoryInsights()   → admin.service.js#getAdminInventory (REUSED
 *   directly from Phase 18F — see that hook's file for why; this is not a
 *   new endpoint, just a new consumer of an existing one)
 * - useCouponPerformance()   → admin.service.js#getAdminCoupons (REUSED
 *   directly from Phase 18E, sorted client-side by usageCount — sorting
 *   an already-fetched page is pure display logic, not business logic)
 * - usePaymentAnalytics()    → analytics.service.js#getPaymentAnalytics
 * - useReviewAnalytics()     → analytics.service.js#getReviewAnalytics
 * - useRecentActivity()      → admin.service.js#getRecentActivity (REUSED
 *   directly from Phase 17, unchanged)
 *
 * WHY THESE ARE READ-ONLY QUERIES, NO MUTATIONS:
 * Analytics has no write operations anywhere in this phase's scope — this
 * file only exports useQuery-based hooks, unlike every prior admin
 * feature's hook file which also had useMutation-based ones.
 *
 * PRODUCTION-READY BECAUSE:
 * - Every hook's queryKey includes {startDate, endDate}, so React Query
 *   automatically refetches whenever DateRangeFilter changes the range —
 *   no manual refetch() wiring needed anywhere
 * - Reused hooks (useInventoryInsights, useCouponPerformance,
 *   useRecentActivity) share React Query's cache with their origin
 *   phases' own hooks when the same data happens to already be loaded —
 *   not a duplicate fetch
 */

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getSalesAnalytics,
  getCustomerGrowth,
  getTopProducts,
  getTopCategories,
  getPaymentAnalytics,
  getReviewAnalytics,
} from "../services/analytics.service";
import {
  getAdminOrdersOverview,
  getAdminInventory,
  getAdminCoupons,
  getRecentActivity,
} from "../services/admin.service";
import { useAnalyticsStore } from "../store/analytics.store";

const useDateRange = () => {
  const startDate = useAnalyticsStore((s) => s.startDate);
  const endDate = useAnalyticsStore((s) => s.endDate);
  return { startDate, endDate };
};

/** Dashboard summary cards — revenue/orders/users/products totals + deltas. */
export const useDashboardStats = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "dashboard", { startDate, endDate }],
    queryFn: async () => (await getDashboardStats({ startDate, endDate })).data.data,
    staleTime: 60 * 1000,
  });
  return { stats: query.data, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
};

/** Revenue/orders time series for SalesChart. */
export const useSalesAnalytics = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "sales", { startDate, endDate }],
    queryFn: async () => (await getSalesAnalytics({ startDate, endDate })).data.data.series,
    staleTime: 60 * 1000,
  });
  return { series: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
};

/** Order volume + status breakdown for OrdersChart. */
export const useOrdersOverview = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "orders-overview", { startDate, endDate }],
    queryFn: async () => (await getAdminOrdersOverview({ startDate, endDate })).data.data,
    staleTime: 60 * 1000,
  });
  return {
    series: query.data?.series ?? [],
    byStatus: query.data?.byStatus ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/** New-customer signups over time for CustomerGrowthChart. */
export const useCustomerGrowth = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "customer-growth", { startDate, endDate }],
    queryFn: async () => (await getCustomerGrowth({ startDate, endDate })).data.data.series,
    staleTime: 60 * 1000,
  });
  return { series: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
};

/** Best-selling products for TopProducts. */
export const useTopProducts = (limit = 5) => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "top-products", { startDate, endDate, limit }],
    queryFn: async () => (await getTopProducts({ startDate, endDate, limit })).data.data.products,
    staleTime: 60 * 1000,
  });
  return { products: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
};

/** Best-performing categories for TopCategories. */
export const useTopCategories = (limit = 5) => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "top-categories", { startDate, endDate, limit }],
    queryFn: async () => (await getTopCategories({ startDate, endDate, limit })).data.data.categories,
    staleTime: 60 * 1000,
  });
  return { categories: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
};

/**
 * Inventory summary for InventoryInsights — REUSES Phase 18F's
 * getAdminInventory directly rather than a new analytics endpoint. Date
 * range is intentionally NOT passed — stock levels are a current-state
 * snapshot, not a historical metric a date range would meaningfully filter.
 */
export const useInventoryInsights = () => {
  const query = useQuery({
    queryKey: ["admin", "inventory", { search: undefined, status: undefined, sortBy: "updatedAt", sortOrder: "desc", page: 1, limit: 5 }],
    queryFn: async () => (await getAdminInventory({ page: 1, limit: 5 })).data.data,
    staleTime: 60 * 1000,
  });
  return {
    summary: query.data?.summary,
    lowStockItems: (query.data?.items ?? []).filter((i) => i.status !== "in_stock"),
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/**
 * Top coupon performance for CouponAnalytics — REUSES Phase 18E's
 * getAdminCoupons directly, sorted by usageCount client-side (display
 * sorting of already-fetched data, not a new business computation).
 */
export const useCouponPerformance = (limit = 5) => {
  const query = useQuery({
    queryKey: ["admin", "coupons", { search: undefined, status: undefined, sortBy: "createdAt", sortOrder: "desc", page: 1, limit: 50 }],
    queryFn: async () => (await getAdminCoupons({ page: 1, limit: 50 })).data.data.coupons,
    staleTime: 60 * 1000,
  });
  const topCoupons = [...(query.data ?? [])]
    .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    .slice(0, limit);
  return { topCoupons, isLoading: query.isLoading, isError: query.isError };
};

/** Payment method breakdown for PaymentAnalytics. FLAGGED endpoint. */
export const usePaymentAnalytics = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "payments", { startDate, endDate }],
    queryFn: async () => (await getPaymentAnalytics({ startDate, endDate })).data.data,
    staleTime: 60 * 1000,
    retry: false, // flagged endpoint — fail fast rather than retry a possible 404
  });
  return {
    byMethod: query.data?.byMethod ?? [],
    successRate: query.data?.successRate,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/** Rating distribution for ReviewAnalytics. FLAGGED endpoint. */
export const useReviewAnalytics = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "reviews", { startDate, endDate }],
    queryFn: async () => (await getReviewAnalytics({ startDate, endDate })).data.data,
    staleTime: 60 * 1000,
    retry: false, // flagged endpoint
  });
  return {
    averageRating: query.data?.averageRating,
    ratingDistribution: query.data?.ratingDistribution ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/** Recent admin activity feed — REUSES Phase 17's getRecentActivity unchanged. */
export const useRecentActivity = (limit = 10) => {
  const query = useQuery({
    queryKey: ["admin", "dashboard", "activity", limit],
    queryFn: async () => (await getRecentActivity(limit)).data.data.activities,
    staleTime: 60 * 1000,
  });
  return { activities: query.data ?? [], isLoading: query.isLoading, isError: query.isError };
};

