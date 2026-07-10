/**
 * src/store/checkout.store.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Manages CHECKOUT UI STATE ONLY (not server data).
 * 
 * React Query owns the server state:
 *   - Cart data (items, totals, appliedCoupon) — useCartQuery (Phase 9)
 *   - Addresses — useAddresses (Phase 11)
 *   - Order creation result — useCreateOrder (this phase)
 * 
 * Zustand owns these UI concerns:
 *   - selectedAddressId (which address the user picked for shipping)
 *   - currentStep (for CheckoutProgress: "review" | "placing" | "done")
 *   - hasLockedCart (whether checkout-start has already been called this
 *     session, to avoid calling it repeatedly on re-renders)
 * 
 * SEPARATION OF CONCERNS:
 * This keeps the store minimal and focused on UI behavior. Cart locking
 * itself is still owned by the Phase 9 cart hooks/service — this store
 * only remembers WHETHER we've triggered it, not HOW.
 * 
 * PERSISTENCE:
 * Does NOT persist to localStorage. On page refresh, checkout state
 * resets — sensible UX since cart lock state should be re-verified from
 * the backend (via cart.status) rather than trusted from stale client state.
 * 
 * REUSABILITY:
 * Future phases (Payment, Order confirmation) can read selectedAddressId
 * one last time if needed, but generally this store's job ends once
 * createOrder() succeeds and the user is redirected away from checkout.
 */

import { create } from "zustand";

export const useCheckoutStore = create((set) => ({
  // Which address the user has selected for shipping
  selectedAddressId: null,

  // Current step of the checkout UI (drives CheckoutProgress component)
  // "review" -> user is reviewing cart/address/coupon
  // "placing" -> order creation mutation in flight
  // "done" -> order created, about to redirect
  currentStep: "review",

  // Whether checkout-start (cart lock) has already been triggered
  // this checkout session — prevents duplicate lock calls
  hasTriggeredCheckoutStart: false,

  /**
   * Set the selected shipping address
   * Called when user picks an address in AddressSelector (reused from Phase 11)
   * 
   * @param {string} addressId
   */
  setSelectedAddressId: (addressId) =>
    set(() => ({
      selectedAddressId: addressId,
    })),

  /**
   * Advance/set the checkout step
   * Used by CheckoutProgress to show current stage
   * 
   * @param {"review"|"placing"|"done"} step
   */
  setCurrentStep: (step) =>
    set(() => ({
      currentStep: step,
    })),

  /**
   * Mark that checkout-start has been triggered
   * Prevents CheckoutPage from calling useCheckoutStart() multiple times
   */
  markCheckoutStartTriggered: () =>
    set(() => ({
      hasTriggeredCheckoutStart: true,
    })),

  /**
   * Reset all checkout UI state
   * Called when:
   * - Order is successfully placed (before redirect)
   * - User navigates away from checkout without completing
   * - User logs out
   */
  resetCheckoutStore: () =>
    set(() => ({
      selectedAddressId: null,
      currentStep: "review",
      hasTriggeredCheckoutStart: false,
    })),
}));