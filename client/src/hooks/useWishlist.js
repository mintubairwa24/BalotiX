// src/hooks/useWishlist.js
//
// WHY THIS FILE EXISTS:
// Central hook module for all wishlist operations. Exporting named hooks
// (not a single mega-hook) means components import only what they need,
// keeping bundles tree-shakeable and tests focused.
//
// ARCHITECTURE — three-layer separation:
//   1. Service  (wishlist.service.js) — pure HTTP, no React
//   2. Hook     (this file)           — React Query + Zustand sync + error handling
//   3. UI       (components/)         — consumes hooks, has zero API knowledge
//
// OPTIMISTIC UPDATE STRATEGY:
// WishlistButton needs the heart to toggle instantly on click — not after the
// network round-trip. We achieve this with two Zustand actions:
//   optimisticAdd(productId)    → called in onMutate before the request
//   optimisticRemove(productId) → called in onMutate before the request
// On success → invalidate ["wishlist"] → server fetch re-syncs Zustand
// On error   → revert the Zustand state using the context returned by onMutate
//
// WHY useEffect FOR ZUSTAND SYNC (not inside queryFn):
// React 18 StrictMode double-invokes effects and renders. Putting Zustand
// writes inside queryFn can cause them to fire twice on mount. Using
// useEffect({ data }) is the correct React pattern — it runs after render
// and only when data actually changes.
//
// AUTH GUARD PLACEMENT:
// Authentication checks live in WishlistButton (the component), not here.
// Hooks stay unaware of navigation so they remain composable and testable.
//
// FUTURE MODULES:
// Phase 8  — WishlistPage, WishlistButton, WishlistItem use these hooks
// Phase 9  — ProductDetailsPage's WishlistButton reuses useAddToWishlist,
//             useRemoveFromWishlist, useIsWishlisted
// Phase 10 — Checkout summary may call useWishlistQuery for cross-sell

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
} from "../services/wishlist.service";
import { useWishlistStore } from "../store/wishlist.store";
import { useAuthStore } from "../store";

// ─── Query key — matches Part 8 of PROJECT_CONTEXT.md exactly ───────────────
const WISHLIST_KEY = ["wishlist"];

// ─────────────────────────────────────────────────────────────────────────────
// useWishlistQuery — fetch full wishlist + keep Zustand in sync
// ─────────────────────────────────────────────────────────────────────────────
//
// WHO CALLS THIS:
// • WishlistPage mounts this on every visit (staleTime: 0 = always refetch)
// • For ProductCard / ProductDetailsPage integration (future phases), hoist
//   this call to CustomerLayout so wishlistedIds is populated before any
//   ProductCard renders.
//
export function useWishlistQuery() {
  const { isAuthenticated } = useAuthStore();
  const { syncFromWishlist } = useWishlistStore();

  const query = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: async () => {
      const response = await getWishlist();
      // Return just the wishlist object — Zustand sync happens in useEffect
      return response.data.data.wishlist;
    },
    enabled: isAuthenticated,  // never runs when logged out
    staleTime: 0,              // wishlist is always fresh (Part 10 rule)
    retry: false,              // don't retry on 401 — interceptor handles refresh
  });

  // Sync Zustand store whenever React Query delivers new server data.
  // useEffect (not queryFn) because React 18 StrictMode double-invokes
  // queryFn in development — putting Zustand writes there would double-fire.
  useEffect(() => {
    if (query.isSuccess) {
      syncFromWishlist(query.data?.items ?? []);
    }
  }, [query.data, query.isSuccess, syncFromWishlist]);

  return query;
}

// ─────────────────────────────────────────────────────────────────────────────
// useAddToWishlist — POST /wishlist/items
// ─────────────────────────────────────────────────────────────────────────────
export function useAddToWishlist() {
  const queryClient = useQueryClient();
  const { optimisticAdd, optimisticRemove } = useWishlistStore();

  return useMutation({
    mutationFn: ({ productId }) => addToWishlist({ productId }),

    // Optimistic update fires BEFORE the request — heart fills instantly
    onMutate: ({ productId }) => {
      optimisticAdd(productId);
      return { productId }; // passed to onError for rollback
    },

    onSuccess: (_, { productId }) => {
      // Re-fetch wishlist — the returned data drives the final Zustand sync
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });

      // Business Rule 9: adding an already-wishlisted item returns 200.
      // We show "Saved to wishlist" regardless — the server is idempotent.
      toast.success("Saved to wishlist");
    },

    onError: (error, _, context) => {
      // Revert the optimistic heart-fill
      if (context?.productId) optimisticRemove(context.productId);

      const message =
        error?.response?.data?.message ?? "Failed to add to wishlist";
      toast.error(message);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useRemoveFromWishlist — DELETE /wishlist/items/:productId
// ─────────────────────────────────────────────────────────────────────────────
export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  const { optimisticRemove, optimisticAdd } = useWishlistStore();

  return useMutation({
    mutationFn: ({ productId }) => removeFromWishlist(productId),

    // Optimistic update — heart empties instantly
    onMutate: ({ productId }) => {
      optimisticRemove(productId);
      return { productId };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
      toast.success("Removed from wishlist");
    },

    onError: (error, _, context) => {
      // Revert — put the heart back
      if (context?.productId) optimisticAdd(context.productId);

      const message =
        error?.response?.data?.message ?? "Failed to remove from wishlist";
      toast.error(message);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useMoveToCart — POST /wishlist/items/:productId/move-to-cart
// ─────────────────────────────────────────────────────────────────────────────
//
// IMPORTANT: No optimistic update here by design.
// The cart add may fail (out of stock, cart locked at checkout, etc.).
// Per the Phase 8 spec: on failure, keep the item in the wishlist.
// So we only mutate Zustand/cache AFTER confirmed server success.
//
export function useMoveToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity = 1 }) =>
      moveToCart(productId, { quantity }),

    onSuccess: () => {
      // Invalidate BOTH caches:
      // • ["wishlist"] — item is now gone from the wishlist
      // • ["cart"]     — item is now in the cart (CartIcon badge update)
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEY });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Moved to cart!");
    },

    onError: (error) => {
      // On failure, item STAYS in wishlist — no state revert needed
      const message =
        error?.response?.data?.message ??
        "Couldn't move to cart. Please try again.";
      toast.error(message);
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// useIsWishlisted — O(1) per-product status check from Zustand
// ─────────────────────────────────────────────────────────────────────────────
//
// Uses a selector — the component re-renders ONLY when this specific productId's
// status changes, not on every wishlist mutation. This is critical for
// performance when hundreds of ProductCards each call this hook.
//
export function useIsWishlisted(productId) {
  return useWishlistStore(
    (state) => state.wishlistedIds.includes(productId)
  );
}