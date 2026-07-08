/**
 * src/store/cart.store.js
 *
 * PURPOSE:
 *   Holds only the cart item count for the Header badge icon.
 *   The full cart data (items, totals, coupon) lives in React Query
 *   inside the future CartPage — that's server state, not global state.
 *
 * WHY ZUSTAND FOR JUST A NUMBER:
 *   The cart badge in the Header needs to update instantly when the
 *   user adds an item from a ProductCard anywhere in the app — without
 *   the Header re-fetching the cart. A Zustand store lets any component
 *   call setItemCount() and the Header reacts immediately.
 *
 * FUTURE WIRING:
 *   cart.service.js → React Query mutation onSuccess → setItemCount(cart.itemCount)
 *   On app mount: if isAuthenticated, fetch GET /cart → setItemCount(cart.itemCount)
 */

import { create } from "zustand";

export const useCartStore = create((set) => ({
  itemCount: 0,
  setItemCount: (itemCount) => set({ itemCount }),
  increment: () => set((state) => ({ itemCount: state.itemCount + 1 })),
  decrement: () =>
    set((state) => ({ itemCount: Math.max(0, state.itemCount - 1) })),
  reset: () => set({ itemCount: 0 }),
}));


// export const useCartStore = create((set) => ({
//   // Mini cart dropdown visibility in header
//   isMiniCartOpen: false,
 
//   // Actions to toggle mini cart
//   toggleMiniCart: () =>
//     set((state) => ({
//       isMiniCartOpen: !state.isMiniCartOpen,
//     })),
 
//   openMiniCart: () =>
//     set(() => ({
//       isMiniCartOpen: true,
//     })),
 
//   closeMiniCart: () =>
//     set(() => ({
//       isMiniCartOpen: false,
//     })),
// }));