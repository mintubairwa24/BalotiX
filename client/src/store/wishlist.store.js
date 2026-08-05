// src/store/wishlist.store.js
//
// WHY THIS FILE EXISTS:
// Manages two pieces of UI state that must be available synchronously
// across the entire component tree — without prop-drilling and without
// waiting for a React Query fetch to complete:
//
//   1. itemCount      — powers the WishlistIcon badge in the Header
//   2. wishlistedIds  — lets every WishlistButton know if its product is
//                       already saved, enabling instant heart-fill state
//
// WHY ZUSTAND AND NOT REACT QUERY CACHE:
// React Query owns the authoritative server data (full wishlist object with
// populated products). This store holds DERIVED UI STATE — counts and ID
// sets — that must be readable outside React Query's context (e.g., a
// ProductCard rendered in a grid doesn't fetch the wishlist itself).
//
// SYNC CONTRACT:
// useWishlistQuery (src/hooks/useWishlist.js) is the single writer.
// Every time the server data arrives it calls syncFromWishlist(items),
// keeping this store in sync with ground truth.
// Optimistic actions (optimisticAdd / optimisticRemove) give instant UI
// feedback while the mutation is in-flight. On error, they are reverted.
//
// FUTURE MODULES:
// Phase 8  — WishlistPage reads query data; WishlistButton reads wishlistedIds
// Phase 9  — ProductDetailsPage's WishlistButton uses wishlistedIds + mutations
// Phase 10 — Checkout may read itemCount to nudge users
// Phase 12 — Admin analytics may read itemCount for dashboard counters

import { create } from "zustand";

const normalizeProductId = (id) => {
  if (id === undefined || id === null) return null;
  if (typeof id === "object") return id._id?.toString?.() || id.id?.toString?.() || null;
  return String(id);
};

export const useWishlistStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────
  itemCount: 0,

  /**
   * Flat array of productId strings currently in the wishlist.
   * Populated by syncFromWishlist on every successful server fetch.
   * Used by useIsWishlisted(productId) for O(1) status checks.
   */
  wishlistedIds: [],

  // ─── Server-sync actions ─────────────────────────────────────────────────

  /**
   * Called by useWishlistQuery after every successful GET /wishlist.
   * Accepts the raw items array (each item has a populated productId object
   * or a plain productId string, depending on query projection).
   * Derives both wishlistedIds and itemCount from ground truth.
   */
  syncFromWishlist: (items = []) => {
    const ids = items
      .map((item) => normalizeProductId(item.productId))
      .filter(Boolean);

    set({ wishlistedIds: ids, itemCount: ids.length });
  },

  // ─── Optimistic UI actions ────────────────────────────────────────────────
  // Called BEFORE the mutation resolves so the heart icon toggles instantly.
  // Reverted in onError callbacks inside useWishlist.js.

  /**
   * Optimistic add — idempotent (won't double-count if called twice).
   * Mirrors Rule 9: adding an already-wishlisted product is a no-op.
   */
  optimisticAdd: (productId) =>
    set((state) => {
      const normalizedId = normalizeProductId(productId);
      if (!normalizedId || state.wishlistedIds.includes(normalizedId)) return state;

      return {
        wishlistedIds: [...state.wishlistedIds, normalizedId],
        itemCount: state.itemCount + 1,
      };
    }),

  /**
   * Optimistic remove — safe even if productId is not in the array.
   */
  optimisticRemove: (productId) =>
    set((state) => {
      const normalizedId = normalizeProductId(productId);
      if (!normalizedId) return state;

      return {
        wishlistedIds: state.wishlistedIds.filter((id) => id !== normalizedId),
        itemCount: Math.max(0, state.itemCount - 1),
      };
    }),

  // ─── Derived reads ───────────────────────────────────────────────────────

  /**
   * Synchronous O(1) check used by useIsWishlisted(productId).
   * Components should prefer the selector form:
   *   useWishlistStore(state => state.wishlistedIds.includes(productId))
   * for proper re-render granularity.
   */
  isWishlisted: (productId) =>
    get().wishlistedIds.includes(normalizeProductId(productId)),

  // ─── Reset ───────────────────────────────────────────────────────────────

  /**
   * Called on logout to wipe derived state.
   * NOTE: This should be called from the logout mutation's onSuccess handler
   * (src/services/auth.service.js) alongside useAuthStore.clearUser().
   * Until that wiring is added, wishlistedIds may contain stale IDs after
   * logout — harmless since WishlistButton checks isAuthenticated before
   * any mutation, and /wishlist is a ProtectedRoute.
   */
  reset: () => set({ itemCount: 0, wishlistedIds: [] }),

  // ─── Legacy action (kept for Header WishlistIcon backward compat) ─────────
  setItemCount: (n) => set({ itemCount: n }),
}));