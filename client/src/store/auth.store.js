/**
 * src/store/auth.store.js
 *
 * PURPOSE:
 *   Global authentication state, readable from anywhere in the component
 *   tree without prop drilling.
 *
 * WHAT THIS STORE HOLDS:
 *   - user            The authenticated user object from the backend
 *   - isAuthenticated Derived boolean for easy conditional checks
 *   - isLoading       True while the initial /auth/me check is in flight
 *
 * WHAT IT DOES NOT HOLD:
 *   - JWT tokens (HttpOnly cookies, invisible to JavaScript)
 *   - Server data like cart items or products (belongs in React Query)
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   - useAuth.js (src/hooks/useAuth.js) calls setUser()/clearUser() after
 *     getMe() resolves on app mount
 *   - LoginForm calls setUser() after a successful login mutation
 *   - src/api/interceptors.js calls clearUser() when token refresh fails
 *
 * REUSE BY OTHER MODULES:
 *   - ProtectedRoute / AdminRoute (src/routes/) read isAuthenticated, user
 *   - Navbar reads user.name for display
 *   - cart.store.js / wishlist.store.js gate their fetches on isAuthenticated
 */

import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // ── State ──────────────────────────────────────────────────────────────

  /**
   * { _id, name, email, role: "customer"|"admin", isVerified, isActive }
   */
  user: null,

  isAuthenticated: false,

  /** True during the initial /auth/me call on app mount */
  isLoading: true,

  // ── Actions ────────────────────────────────────────────────────────────

  /** Called after login, registration, or a successful /auth/me check */
  setUser: (user) =>
    set({ user, isAuthenticated: true, isLoading: false }),

  /** Called on logout or failed token refresh */
  clearUser: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),

  /** Toggled while the initial session check is in flight */
  setLoading: (isLoading) => set({ isLoading }),

  /** Partial update — e.g. after a future profile edit */
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : state.user,
    })),
}));