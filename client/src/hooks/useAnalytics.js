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
 * analytics.store.js.
 *
 * BACKEND COMMUNICATION:
 * Each hook maps to the actual backend endpoints:
 * - useDashboardStats()     → GET /analytics/dashboard
 * - useSalesAnalytics()     → GET /analytics/sales
 * - useProductAnalytics()   → GET /analytics/products
 * - useCategoryAnalytics()  → GET /analytics/categories
 * - useCustomerAnalytics()  → GET /analytics/customers
 * - useOrdersOverview()     → GET /admin/orders/overview
 * - useReviewAnalytics()    → GET /analytics/reviews
 */

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getCategoryAnalytics,
  getCustomerAnalytics,
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
  const query = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: async () => (await getDashboardStats()).data.data,
    staleTime: 60 * 1000,
  });
  return { stats: query.data, isLoading: query.isLoading, isError: query.isError, refetch: query.refetch };
};

/** Revenue/orders time series for SalesChart. Maps to GET /analytics/sales. */
export const useSalesAnalytics = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "sales", { startDate, endDate }],
    queryFn: async () => {
      const response = await getSalesAnalytics({ startDate, endDate });
      // Backend returns { totalSales, averageOrderValue, orderCount, revenueGrowth }
      return response.data.data?.analytics || response.data.data;
    },
    staleTime: 60 * 1000,
  });
  // Ensure series is always an array for recharts. Backend returns an aggregate object,
  // not a time series, so default to empty array to avoid "chartData.slice is not a function"
  const data = query.data;
  const series = Array.isArray(data) ? data : [];
  return { series, isLoading: query.isLoading, isError: query.isError };
};

/** Order volume + status breakdown for OrdersChart. Maps to GET /admin/orders/overview. */
export const useOrdersOverview = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["admin", "orders-overview", { startDate, endDate }],
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

/** Customer analytics for CustomerGrowthChart. Maps to GET /analytics/customers. */
export const useCustomerAnalytics = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "customers", { startDate, endDate }],
    queryFn: async () => {
      const response = await getCustomerAnalytics({ startDate, endDate });
      return response.data.data?.analytics || response.data.data;
    },
    staleTime: 60 * 1000,
  });
  return {
    data: query.data,
    totalUsers: query.data?.totalUsers ?? 0,
    newUsers: query.data?.newUsers ?? 0,
    activeUsers: query.data?.activeUsers ?? 0,
    repeatCustomers: query.data?.repeatCustomers ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/** Best-selling products for TopProducts. Maps to GET /analytics/products. */
export const useProductAnalytics = (limit = 5) => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "products", { startDate, endDate, limit }],
    queryFn: async () => {
      const response = await getProductAnalytics({ startDate, endDate, limit });
      return response.data.data?.analytics || response.data.data;
    },
    staleTime: 60 * 1000,
  });
  return {
    topSelling: query.data?.topSellingProducts ?? [],
    worstSelling: query.data?.worstSellingProducts ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/** Best-performing categories for TopCategories. Maps to GET /analytics/categories. */
export const useCategoryAnalytics = (limit = 5) => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "categories", { startDate, endDate, limit }],
    queryFn: async () => {
      const response = await getCategoryAnalytics({ startDate, endDate, limit });
      return response.data.data?.analytics || response.data.data;
    },
    staleTime: 60 * 1000,
  });
  return {
    bestCategories: query.data?.bestCategories ?? [],
    revenuePerCategory: query.data?.revenuePerCategory ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/**
 * Inventory summary for InventoryInsights — REUSES Phase 18F's
 * getAdminInventory directly rather than a new analytics endpoint.
 */
export const useInventoryInsights = () => {
  const query = useQuery({
    queryKey: ["admin", "inventory", { page: 1, limit: 5 }],
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
 * getAdminCoupons directly, sorted by usageCount client-side.
 */
export const useCouponPerformance = (limit = 5) => {
  const query = useQuery({
    queryKey: ["admin", "coupons", { page: 1, limit: 50 }],
    queryFn: async () => (await getAdminCoupons({ page: 1, limit: 50 })).data.data?.coupons ?? [],
    staleTime: 60 * 1000,
  });
  const topCoupons = [...(query.data ?? [])]
    .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
    .slice(0, limit);
  return { topCoupons, isLoading: query.isLoading, isError: query.isError };
};

/** Payment analytics. Maps to GET /analytics/payments. */
export const usePaymentAnalytics = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "payments", { startDate, endDate }],
    queryFn: async () => {
      const response = await getPaymentAnalytics({ startDate, endDate });
      return response.data.data?.analytics || response.data.data;
    },
    staleTime: 60 * 1000,
    retry: false,
  });
  return {
    byMethod: query.data?.byMethod ?? [],
    successRate: query.data?.successRate,
    totalAmount: query.data?.totalAmount ?? 0,
    statusBreakdown: query.data?.statusBreakdown ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/** Review analytics. Maps to GET /analytics/reviews. */
export const useReviewAnalytics = () => {
  const { startDate, endDate } = useDateRange();
  const query = useQuery({
    queryKey: ["analytics", "reviews", { startDate, endDate }],
    queryFn: async () => {
      const response = await getReviewAnalytics({ startDate, endDate });
      return response.data.data?.analytics || response.data.data;
    },
    staleTime: 60 * 1000,
    retry: false,
  });
  return {
    averageRating: query.data?.platformAverageRating,
    totalReviews: query.data?.totalReviews ?? 0,
    ratingDistribution: query.data?.ratingDistribution ?? [],
    topRated: query.data?.topRatedProducts ?? [],
    lowestRated: query.data?.lowestRatedProducts ?? [],
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

// ═══════════════════════════════════════════════════════════════════════════════
// BACKWARD-COMPATIBLE ALIASES
// The components below were written before the API alignment. These aliases
// map the old hook names to the new, backend-correct implementations so
// components don't need rewriting.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use useCustomerAnalytics instead. Alias kept for
 * CustomerGrowthChart.jsx which expects { series, isLoading, isError }.
 */
export const useCustomerGrowth = (limit = 5) => {
  const { data, isLoading, isError } = useCustomerAnalytics();
  const series = [];
  if (data?.range) {
    // Build a { date, newCustomers } series from the available data
    series.push({
      date: data.range.from,
      newCustomers: data.newUsers ?? 0,
    });
  }
  return { series: data?.newUsers ? [{ date: new Date().toISOString(), newCustomers: data.newUsers }] : [], isLoading, isError };
};

/**
 * @deprecated Use useProductAnalytics instead. Alias kept for
 * TopProducts.jsx which expects { products, isLoading, isError }.
 */
export const useTopProducts = (limit = 5) => {
  const { topSelling, isLoading, isError } = useProductAnalytics(limit);
  const products = topSelling.map((p) => ({
    ...p,
    _id: p.productId,
    name: p.productName,
    image: undefined,
  }));
  return { products, isLoading, isError };
};

/**
 * @deprecated Use useCategoryAnalytics instead. Alias kept for
 * TopCategories.jsx which expects { categories, isLoading, isError }.
 */
export const useTopCategories = (limit = 5) => {
  const { bestCategories, isLoading, isError } = useCategoryAnalytics(limit);
  const categories = bestCategories.map((c) => ({
    ...c,
    _id: c.categoryId,
    name: c.categoryName,
  }));
  return { categories, isLoading, isError };
};

