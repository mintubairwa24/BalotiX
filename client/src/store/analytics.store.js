/**
 * FILE: src/store/analytics.store.js
 *
 * ============================================================================
 * ANALYTICS STORE — Phase 18H (Analytics & Reports)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Zustand store for the ONE piece of shared UI state every analytics
 * component in this phase depends on: the active date range. Unlike
 * every prior admin-list store (search/filter/sort/page), analytics has
 * no pagination or per-row selection — the date range IS the query-
 * shaping state, and it fans out to essentially every chart/card on the
 * page simultaneously, rather than one table.
 *
 * WHY A STORE, NOT PROPS PASSED DOWN FROM AnalyticsDashboard:
 * DashboardCards, RevenueCard, SalesChart, OrdersChart,
 * CustomerGrowthChart, TopProducts, TopCategories, CouponAnalytics,
 * PaymentAnalytics, and ReviewAnalytics are all siblings composed
 * independently inside AnalyticsDashboard — each one calls its own
 * useAnalytics.js hook, which reads the date range from this store
 * directly. Passing `dateRange` as a prop through nine-plus sibling
 * components would work, but every one of them would need identical
 * prop-plumbing; a shared store removes that entirely, same reasoning as
 * every prior admin list's search/filter store.
 *
 * WHY `preset` IS STORED ALONGSIDE startDate/endDate (not derived):
 * DateRangeFilter shows which preset button (Today/7d/30d/90d/Custom) is
 * currently active — that's UI highlighting state, not just a derived
 * fact from the dates themselves (two custom-picked dates could
 * coincidentally match a preset's range; storing `preset` explicitly
 * avoids reverse-engineering "was this a preset click or a manual pick"
 * from dates alone).
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero server data — every actual analytics number/series lives in
 *   React Query's cache, owned by useAnalytics.js (Convention #3)
 * - Defaults to a sensible "last 30 days" on first load rather than an
 *   empty/all-time range that could be an expensive, slow first query
 * - No persistence — resets on reload, consistent with every store in
 *   this project (Convention #5)
 */

import { create } from "zustand";

const today = new Date();
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(today.getDate() - 30);

const toIsoDate = (date) => date.toISOString().slice(0, 10);

export const useAnalyticsStore = create((set) => ({
  preset: "30d", // "today" | "7d" | "30d" | "90d" | "custom"
  startDate: toIsoDate(thirtyDaysAgo),
  endDate: toIsoDate(today),

  setPreset: (preset, startDate, endDate) => set({ preset, startDate, endDate }),
  setCustomRange: (startDate, endDate) => set({ preset: "custom", startDate, endDate }),
}));