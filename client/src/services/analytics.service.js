/**
 * FILE: src/services/analytics.service.js
 *
 * ============================================================================
 * src/services/analytics.service.js
 * ANALYTICS SERVICE — Phase 17 Extension (Admin Dashboard Integration)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Pure Axios data-access layer for admin-facing analytics. Like every other
 * *.service.js in this project, it contains NO React, NO React Query, NO
 * Zustand — just functions that call the backend and return the FULL Axios
 * response object. The hooks layer (useAdminDashboard.js) is responsible for
 * unwrapping `response.data.data`, handling loading/error state, and caching.
 *
 * This keeps a hard boundary: if the backend contract changes, only this
 * file needs to change — no hook, component, or store is touched.
 *
 * BACKEND COMMUNICATION:
 * All endpoints are mounted at /api/analytics in the backend. The routes are:
 *   GET /analytics/dashboard    → Dashboard overview stats
 *   GET /analytics/sales        → Sales/revenue time series
 *   GET /analytics/products     → Product performance (replaces /top-products)
 *   GET /analytics/categories   → Category performance (replaces /top-categories)
 *   GET /analytics/customers    → Customer growth (replaces /customers/growth)
 *   GET /analytics/coupons      → Coupon usage analytics
 *   GET /analytics/inventory    → Inventory analytics
 *   GET /analytics/reviews      → Review analytics
 *   GET /analytics/revenue      → Revenue analytics
 *   GET /analytics/export/csv   → CSV export
 *   GET /analytics/export/excel → Excel export
 */

import api from "../api/axios";

const ANALYTICS_ENDPOINTS = {
  DASHBOARD_STATS: "/analytics/dashboard",
  SALES: "/analytics/sales",
  PRODUCTS: "/analytics/products",
  CATEGORIES: "/analytics/categories",
  CUSTOMERS: "/analytics/customers",
  COUPONS: "/analytics/coupons",
  INVENTORY: "/analytics/inventory",
  PAYMENTS: "/analytics/payments",
  REVIEWS: "/analytics/reviews",
  REVENUE: "/analytics/revenue",
};

/**
 * Fetch summary statistics for the admin dashboard overview.
 * @returns {Promise<AxiosResponse>} full axios response
 */
export const getDashboardStats = () => {
  return api.get(ANALYTICS_ENDPOINTS.DASHBOARD_STATS);
};

/**
 * Fetch a revenue/orders time series for SalesChart.
 * @param {object} params - { startDate, endDate, period? }
 */
export const getSalesAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.SALES, { params });
};

/**
 * Fetch product performance data for TopProducts.
 * @param {object} params - { startDate, endDate, limit? }
 */
export const getProductAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.PRODUCTS, { params });
};

/**
 * Fetch category performance data for TopCategories.
 * @param {object} params - { startDate, endDate, limit? }
 */
export const getCategoryAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.CATEGORIES, { params });
};

/**
 * Fetch new-customer signups over time for CustomerGrowthChart.
 * @param {object} params - { startDate, endDate }
 */
export const getCustomerAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.CUSTOMERS, { params });
};

/**
 * Fetch coupon usage analytics.
 * @param {object} params - { startDate, endDate }
 */
export const getCouponAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.COUPONS, { params });
};

/**
 * Fetch inventory analytics.
 * @param {object} params - { startDate, endDate }
 */
export const getInventoryAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.INVENTORY, { params });
};

/**
 * Fetch rating distribution for ReviewAnalytics.
 * @param {object} params - { startDate, endDate }
 */
export const getReviewAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.REVIEWS, { params });
};

/**
 * Fetch payment analytics data (by method, success rate, totals).
 * @param {object} params - { startDate, endDate }
 */
export const getPaymentAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.PAYMENTS, { params });
};

/**
 * Fetch revenue analytics data.
 * @param {object} params - { startDate, endDate, period? }
 */
export const getRevenueAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.REVENUE, { params });
};
