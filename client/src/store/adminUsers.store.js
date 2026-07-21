/**
 * FILE: src/store/adminUsers.store.js
 *
 * ============================================================================
 * ADMIN USERS STORE — Phase 18C (User Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Zustand store for the admin Users table's UI state — search term,
 * filters (status/role/verified), sort field/direction, current page, and
 * which user (if any) a destructive/role-change action modal is currently
 * targeting. Exact sibling of adminProducts.store.js and
 * adminCategories.store.js — never holds server data, only the UI controls
 * that shape which query gets fired and which modal is open.
 *
 * MAPPING THE BRIEF'S STATE CATEGORIES TO WHAT'S ACTUALLY IN THIS STORE:
 * The brief asks to separate "User list state / Selected user state /
 * Filters / Pagination / Search / Loading / Errors / User details." Here's
 * how each maps, and — importantly — which ones are DELIBERATELY NOT
 * duplicated here:
 *   - Filters, Pagination, Search  → `search`, `status`, `role`,
 *     `verified`, `sortBy`, `sortOrder`, `page`, `limit` below.
 *   - Selected user state           → `actionModal.userId` below — but
 *     ONLY the id of whichever user a modal is acting on, not that user's
 *     actual data.
 *   - User list state, User details → DELIBERATELY OMITTED. The user list
 *     and any single user's full detail are SERVER data, owned by React
 *     Query via useAdminUsersList()/useAdminUserDetail() (see
 *     useAdminUsers.js). Duplicating server data into Zustand would create
 *     two sources of truth that can drift out of sync — this project's
 *     Convention #3 (React Query owns server state, Zustand owns UI state
 *     only) applies here exactly as it did for Products and Categories.
 *   - Loading, Errors               → DELIBERATELY OMITTED. React Query's
 *     `isLoading`/`isError` already cover the list and detail queries;
 *     each action mutation (suspend/activate/delete/role-change) already
 *     exposes its own `isPending`/`isError` via useMutation, which the
 *     relevant modal reads directly (same pattern as DeleteCategoryModal
 *     in Phase 18B). A parallel error slice here would just be a second,
 *     easily-stale copy of state React Query already tracks correctly.
 *
 * WHY ONE UNIFIED actionModal SLICE INSTEAD OF FOUR SEPARATE ONES:
 * This phase has FOUR action modals (Delete/Suspend/Activate/ChangeRole),
 * each needing to know "which user." Four separate
 * `deleteModalUserId`/`suspendModalUserId`/... fields would work, but a
 * single `{ type, userId }` object makes "is any action modal currently
 * open" a one-line check (`actionModal.type !== null`) instead of an
 * OR-chain across four booleans, and guarantees only one action modal can
 * ever be open at a time by construction — opening a new one automatically
 * replaces whichever was open.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero server data — clean separation from React Query cache
 * - No persistence — resets on reload, consistent with every store in
 *   this project
 * - `resetFilters()` gives UserEmpty's "Clear filters" a single call,
 *   same pattern as Products/Categories
 */

import { create } from "zustand";

const DEFAULT_LIMIT = 10;

export const useAdminUsersStore = create((set) => ({
  // Query-shaping state (list, filters, pagination, search)
  search: "",
  status: "", // "" = all, "active", "suspended"
  role: "", // "" = all, "customer", "admin"
  verified: "", // "" = all, "verified", "unverified"
  sortBy: "createdAt",
  sortOrder: "desc",
  page: 1,
  limit: DEFAULT_LIMIT,

  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setRole: (role) => set({ role, page: 1 }),
  setVerified: (verified) => set({ verified, page: 1 }),
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
  setPage: (page) => set({ page }),
  resetFilters: () =>
    set({ search: "", status: "", role: "", verified: "", page: 1 }),

  // Unified action-modal target — "Selected user state" for whichever
  // destructive/role-change action is currently being confirmed.
  actionModal: { type: null, userId: null },
  openActionModal: (type, userId) => set({ actionModal: { type, userId } }),
  closeActionModal: () => set({ actionModal: { type: null, userId: null } }),
}));