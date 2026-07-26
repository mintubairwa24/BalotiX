/**
 * FILE: src/store/adminCoupons.store.js
 *
 * ============================================================================
 * ADMIN COUPONS STORE — Phase 18E (Coupon Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Zustand store for the admin Coupons table's UI state — search term,
 * status filter, sort field/direction, current page, and which coupon (if
 * any) is queued for deletion. Exact sibling of adminProducts.store.js,
 * adminCategories.store.js, and adminUsers.store.js — never holds server
 * data (the coupon list itself lives in React Query's cache, owned by
 * useAdminCoupons.js), only the UI controls that shape which query gets
 * fired.
 *
 * WHY QUERY-SHAPING STATE LIVES IN A STORE (not component-local useState):
 * CouponSearch, CouponFilters, and CouponsPagination are sibling
 * components — none is an ancestor of the others. Zustand gives all three
 * a shared source of truth without prop-drilling through CouponsPage,
 * identical reasoning to every prior admin list store in this project.
 *
 * WHY changeFilter/changeSearch RESET page TO 1:
 * Same pagination-bug prevention as every sibling store — changing the
 * query's WHERE clause while sitting on a stale page number would render
 * an empty result set. Only setPage moves the page forward.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero server data — clean separation from React Query cache (Convention #3)
 * - No persistence — resets on reload, consistent with every store in
 *   this project (Convention #5)
 * - `deleteModalCouponId` (not a boolean) lets DeleteCouponModal know
 *   WHICH coupon it's confirming, without a second piece of state to
 *   keep in sync
 */

import { create } from "zustand";

const DEFAULT_LIMIT = 10;

export const useAdminCouponsStore = create((set) => ({
  // Query-shaping state
  search: "",
  status: "", // "" = all, "active", "inactive", "expired"
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: DEFAULT_LIMIT,

  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () => set({ search: "", status: "", page: 1 }),

  // Delete confirmation modal — holds the target coupon's id, not a
  // boolean, so DeleteCouponModal always knows exactly which coupon it's
  // acting on.
  deleteModalCouponId: null,
  openDeleteModal: (couponId) => set({ deleteModalCouponId: couponId }),
  closeDeleteModal: () => set({ deleteModalCouponId: null }),
}));