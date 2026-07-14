/**
 * FILE: src/store/adminDashboard.store.js
 *
 * ============================================================================
 * src/store/adminDashboard.store.js
 * ADMIN DASHBOARD STORE — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Zustand store for PURE UI STATE related to the admin shell — never server
 * data (that's what useAdminDashboard.js + React Query own). Consistent
 * with every prior store in this project (cart.store.js only tracks
 * isMiniCartOpen, notifications.store.js only tracks dropdown/filter/page
 * state, etc.) — dashboard stats and activity data are NEVER put in here.
 *
 * STATE OWNED:
 * - isSidebarCollapsed: desktop-only — user can collapse the sidebar to
 *   icon-only width to reclaim screen space. Persists only for the session
 *   (no persistence middleware — resets on reload, by design, same as every
 *   other store in this project — see Architectural Convention #5).
 * - isMobileSidebarOpen: mobile-only — the sidebar is an off-canvas drawer
 *   below the `lg` breakpoint; this tracks whether it's currently open.
 *
 * WHY TWO SEPARATE FLAGS (not one "sidebarOpen" flag):
 * Desktop "collapsed" and mobile "open/closed" are different interaction
 * models (persistent narrow rail vs. temporary overlay drawer) that can be
 * true/false independently of each other depending on viewport — conflating
 * them into one boolean would force AdminLayout to guess intent from screen
 * width alone, which is fragile. Two flags keep each concern explicit.
 *
 * PRODUCTION-READY BECAUSE:
 * - Zero server data — clean separation from React Query cache (Architectural
 *   Convention #3)
 * - No localStorage/persistence — nothing sensitive, nothing server-mirrored,
 *   consistent with Convention #5
 * - Minimal surface area — only what AdminLayout/AdminSidebar/AdminHeader
 *   actually need to coordinate
 */

import { create } from "zustand";

export const useAdminDashboardStore = create((set) => ({
  // Desktop: sidebar collapsed to icon-only rail
  isSidebarCollapsed: false,
  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),

  // Mobile: off-canvas sidebar drawer open/closed
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
}));
