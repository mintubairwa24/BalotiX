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

// NOTE: If your project centralizes endpoints in src/api/endpoints.js
// (see PROJECT_CONTEXT.md, Outstanding TODO #6), move ANALYTICS_ENDPOINTS
// there and import it here — this is a mechanical, low-risk change that
// doesn't affect any consumer of getDashboardStats().
