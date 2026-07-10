/**
 * src/store/coupon.store.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Manages COUPON UI STATE ONLY (not server coupon data).
 * 
 * React Query owns the server state:
 *   - Actual applied coupon data from cart (appliedCoupon field)
 *   - Coupon validation preview results
 *   - Fetched via useCoupon hooks
 * 
 * Zustand owns these UI toggles:
 *   - isCouponFormOpen (show/hide input form)
 *   - validationPreview (temp preview while user decides to apply)
 *   - selectedCode (code user is entering, for form state)
 * 
 * SEPARATION OF CONCERNS:
 * This keeps the store minimal and focused on UI behavior, not data persistence.
 * The useCoupon hooks bring React Query data + coupon.store UI state together.
 * 
 * USE CASES:
 * 1. User clicks "Apply Coupon" → openCouponForm() → Form appears
 * 2. User types code and clicks "Check" → validateCoupon() → validationPreview set
 * 3. User sees preview (discount amount) → clicks "Apply" → applyCurrentCoupon()
 * 4. After success → closeCouponForm() and clearValidationPreview()
 * 5. If coupon already applied → Show CouponBadge with remove button (no form needed)
 * 
 * PERSISTENCE:
 * Coupon UI state does NOT persist to localStorage.
 * On page refresh, coupon form closes (sensible UX).
 * Applied coupon data (from cart) refetch automatically via React Query.
 * 
 * REUSABILITY:
 * This pattern will be extended in future phases:
 * - Phase 11 Orders: couponFilter, couponTab
 * - Phase 12 Admin: couponForm state for management pages
 */

import { create } from "zustand";

/**
 * Coupon UI State
 * 
 * This is NOT the actual coupon data — that comes from useCartQuery (React Query).
 * This is for UI chrome: forms, modals, previews, etc.
 */
export const useCouponStore = create((set, get) => ({
  // Is coupon input form open in CartSummary?
  isCouponFormOpen: false,

  // Validation preview (user entered code, backend validates, show preview before apply)
  validationPreview: null,

  // Current code user is typing
  selectedCode: "",

  /**
   * Open the coupon input form
   * Used when user clicks "Apply Coupon" button
   */
  openCouponForm: () =>
    set(() => ({
      isCouponFormOpen: true,
    })),

  /**
   * Close the coupon input form
   * Used after:
   * - User cancels
   * - User successfully applies coupon
   * - User clicks outside form
   */
  closeCouponForm: () =>
    set(() => ({
      isCouponFormOpen: false,
      selectedCode: "", // Clear input
    })),

  /**
   * Toggle form open/closed
   * Convenience method for toggle buttons
   */
  toggleCouponForm: () =>
    set((state) => ({
      isCouponFormOpen: !state.isCouponFormOpen,
    })),

  /**
   * Set validation preview (result from validateCoupon mutation)
   * Shows what discount user will get if they apply this coupon
   * 
   * @param {Object} preview - { couponId, code, discountAmount, discountPercentage, message }
   */
  setValidationPreview: (preview) =>
    set(() => ({
      validationPreview: preview,
    })),

  /**
   * Clear validation preview
   * Called after:
   * - User applies the coupon (form closes)
   * - User discards the preview
   * - User enters a new code (old preview invalidated)
   */
  clearValidationPreview: () =>
    set(() => ({
      validationPreview: null,
    })),

  /**
   * Set the code user is typing in the form
   * Used for controlled input
   * 
   * @param {string} code - Coupon code text
   */
  setSelectedCode: (code) =>
    set(() => ({
      selectedCode: code,
    })),

  /**
   * Clear selected code
   * Called when form closes or resets
   */
  clearSelectedCode: () =>
    set(() => ({
      selectedCode: "",
    })),

  /**
   * Reset all coupon form state
   * Nuclear option - called when:
   * - User successfully applies coupon
   * - User logs out
   * - Page navigation
   */
  resetCouponForm: () =>
    set(() => ({
      isCouponFormOpen: false,
      validationPreview: null,
      selectedCode: "",
    })),
}));