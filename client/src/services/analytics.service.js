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
 * SCOPE (Phase 17 — Shell + Overview ONLY):
 * DashboardStats needs SUMMARY NUMBERS ONLY — totalRevenue, totalOrders,
 * totalUsers, totalProducts, and optional period-over-period deltas.
 * Per the "DO NOT BUILD: Analytics charts" instruction, this explicitly
 * does NOT fetch time-series / chart-ready data. If a future phase adds
 * charts, that will be a SEPARATE function (e.g. getRevenueTimeSeries()),
 * not a modification of this one — keeps this endpoint's contract stable.
 *
 * BACKEND CONTRACT (ASSUMED — NOT VERIFIED AGAINST A LIVE SERVER):
 * This environment cannot inspect the running backend, so — consistent with
 * every prior phase — the endpoint path and response shape below are
 * assumptions based on the project's existing Admin/Analytics module naming
 * conventions (e.g. Orders/Payments modules use /orders/summary-style
 * aggregate endpoints). If the real endpoint differs, ONLY the
 * ANALYTICS_ENDPOINTS constant and the mapping in the hook need to change.
 *
 *   GET /analytics/dashboard
 *   Response: {
 *     success: true,
 *     data: {
 *       totalRevenue: number,       // PAISE — never do math on this in the UI
 *       totalOrders: number,
 *       totalUsers: number,
 *       totalProducts: number,
 *       revenueChangePercent?: number,   // optional, period-over-period
 *       ordersChangePercent?: number,    // optional
 *       usersChangePercent?: number,     // optional
 *       productsChangePercent?: number,  // optional
 *     }
 *   }
 *
 * PRODUCTION-READY BECAUSE:
 * - Isolated endpoint constant (single point of change if the path is wrong)
 * - No frontend arithmetic on money fields — totalRevenue is passed through
 *   in paise and only formatted for display in the component layer
 * - Returns the full Axios response (consistent contract with every other
 *   service file), so the hook layer's error/loading handling is uniform
 * - Explicit JSDoc so future phases (or another engineer) don't need to
 *   re-read the backend to know what this returns
 */

import api from "../api/axios";

// Flagged and isolated exactly like CART_ENDPOINTS, ORDER_ENDPOINTS, etc.
// from prior phases — change this one constant if the real path differs.
const ANALYTICS_ENDPOINTS = {
  DASHBOARD_STATS: "/analytics/dashboard",
<<<<<<< HEAD
  SALES: "/analytics/sales",
  CUSTOMER_GROWTH: "/analytics/customers/growth",
  TOP_PRODUCTS: "/analytics/top-products",
  TOP_CATEGORIES: "/analytics/top-categories",
  PAYMENTS: "/analytics/payments",
  REVIEWS: "/analytics/reviews",
=======
>>>>>>> origin/main
};

/**
 * Fetch summary statistics for the admin dashboard overview.
 * NUMBERS ONLY — no chart/time-series data (out of scope for Phase 17).
 *
 * @returns {Promise<AxiosResponse>} full axios response; caller extracts
 *          response.data.data in the hooks layer.
 */
export const getDashboardStats = () => {
  return api.get(ANALYTICS_ENDPOINTS.DASHBOARD_STATS);
};

<<<<<<< HEAD

/**
 * Fetch a revenue/orders time series for SalesChart and OrdersChart.
 * @param {object} params - { startDate, endDate, granularity? }
 */
export const getSalesAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.SALES, { params });
};
 
/**
 * Fetch new-customer signups over time for CustomerGrowthChart.
 * @param {object} params - { startDate, endDate }
 */
export const getCustomerGrowth = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.CUSTOMER_GROWTH, { params });
};
 
/**
 * Fetch best-selling products for TopProducts.
 * @param {object} params - { startDate, endDate, limit? }
 */
export const getTopProducts = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.TOP_PRODUCTS, { params });
};
 
/**
 * Fetch best-performing categories for TopCategories.
 * @param {object} params - { startDate, endDate, limit? }
 */
export const getTopCategories = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.TOP_CATEGORIES, { params });
};
 
/**
 * Fetch payment method breakdown for PaymentAnalytics. FLAGGED — see
 * file header; least-grounded assumption in this file.
 * @param {object} params - { startDate, endDate }
 */
export const getPaymentAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.PAYMENTS, { params });
};
 
/**
 * Fetch rating distribution for ReviewAnalytics. FLAGGED — a genuine
 * backend aggregate, deliberately not computed client-side from a
 * paginated list — see file header.
 * @param {object} params - { startDate, endDate }
 */
export const getReviewAnalytics = (params = {}) => {
  return api.get(ANALYTICS_ENDPOINTS.REVIEWS, { params });
};

=======
>>>>>>> origin/main
// NOTE: If your project centralizes endpoints in src/api/endpoints.js
// (see PROJECT_CONTEXT.md, Outstanding TODO #6), move ANALYTICS_ENDPOINTS
// there and import it here — this is a mechanical, low-risk change that
// doesn't affect any consumer of getDashboardStats().
