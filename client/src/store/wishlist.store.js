/**
 * src/store/wishlist.store.js
 *
 * PURPOSE:
 *   Holds only the wishlist item count for the Header badge icon.
 *   Same pattern as cart.store.js — full wishlist data is server state
 *   (React Query), only the count is global UI state (Zustand).
 *
 * FUTURE WIRING:
 *   wishlist.service.js → React Query mutation onSuccess → setItemCount()
 *   On app mount: if isAuthenticated, fetch GET /wishlist → setItemCount()
 */

import { create } from "zustand";

export const useWishlistStore = create((set) => ({
  itemCount: 0,
  setItemCount: (itemCount) => set({ itemCount }),
  reset: () => set({ itemCount: 0 }),
}));