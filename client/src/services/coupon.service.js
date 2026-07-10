/**
 * src/services/coupon.service.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all Coupon backend API interactions. This service is the single source of truth
 * for Coupon operations and will be reused by:
 * - Phase 10: Coupon UI (useCoupon hook, CouponForm, CartSummary integration)
 * - Phase 11: Orders module (order creation with applied coupon)
 * - Future Admin: Coupon management pages
 * 
 * BACKEND CONTRACT:
 * The backend Coupon module implements validation with server-side discount calculation:
 * - Coupon validation returns discount preview (no cart modification)
 * - Coupon application modifies cart total
 * - Coupon removal restores original total
 * - All discounts are calculated by backend
 * 
 * CRITICAL RULES:
 * 1. Service functions NEVER touch React state
 * 2. Service functions ALWAYS return the full Axios response
 * 3. React Query hooks extract: response.data.data (see useCoupon for pattern)
 * 4. Frontend NEVER performs discount arithmetic - backend is single source of truth
 * 5. All discount values (discountAmount, discountPercentage) come from backend only
 * 
 * DISCOUNT HANDLING:
 * - Backend sends discountAmount in PAISE
 * - Backend calculates discountPercentage
 * - Frontend DISPLAYS these values, never recalculates them
 * - Price arithmetic is 100% backend responsibility
 */

import api from "../api/axios";
import { CART_ENDPOINTS } from "../api/endpoints";

/**
 * Validate and preview a coupon (no side effects on cart)
 * 
 * This is a "dry run" - shows what discount WOULD be applied without modifying cart.
 * Use this for:
 * - Showing "You save ₹X" preview before applying
 * - Validating coupon code format
 * - Checking coupon eligibility
 * 
 * @param {string} code - Coupon code to validate
 * 
 * @returns {Promise} Axios response with discount preview
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     couponId: string (MongoDB _id),
 *     code: string (normalized uppercase),
 *     discountAmount: number (in paise),
 *     discountPercentage: number (0-100),
 *     minimumAmount: number (min cart total in paise, or 0),
 *     maximumDiscount: number (cap in paise, or 0),
 *     message: string (e.g., "You save ₹500")
 *   }
 * }
 * 
 * ERROR CASES:
 * - 400: Code not found
 * - 400: Code expired
 * - 400: Coupon not applicable (min amount not met, etc.)
 * - 400: Coupon already applied
 * 
 * IMPORTANT:
 * - This endpoint has ZERO side effects
 * - Cart is NOT modified
 * - Can be called multiple times without consequence
 * - Safe to call while user is typing (debounce recommended)
 * - Backend returns full validation result
 */
export const validateCoupon = (code) => {
  return api.post(CART_ENDPOINTS.VALIDATE_COUPON, {
    code,
  });
};

/**
 * Apply a coupon to the cart
 * 
 * This MODIFIES the cart:
 * 1. Verifies coupon is valid (revalidates)
 * 2. Applies coupon code to cart
 * 3. Recalculates cart total with discount
 * 4. Stores appliedCoupon in cart document
 * 
 * @param {string} code - Coupon code to apply
 * 
 * @returns {Promise} Axios response with updated cart
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     _id: string (cart _id),
 *     items: [...],
 *     subtotal: number (original total in paise, before discount),
 *     total: number (final total in paise, AFTER discount applied),
 *     appliedCoupon: {
 *       couponId: string,
 *       code: string,
 *       discountAmount: number (in paise),
 *       discountPercentage: number,
 *       appliedAt: ISO timestamp
 *     },
 *     itemCount: number,
 *     totalQuantity: number,
 *     status: "active" | "checkout_in_progress"
 *   }
 * }
 * 
 * BEHAVIOR:
 * - If a coupon is already applied, this REPLACES it (only one per cart)
 * - Backend validates all eligibility rules
 * - Cart.total automatically reflects the discount
 * - No frontend calculation needed
 * 
 * ERROR CASES:
 * - 409: Cart is locked (checkout_in_progress)
 * - 400: Code not found or invalid
 * - 400: Code expired
 * - 400: Not applicable (min amount not met)
 * - 400: Code has reached usage limit
 * 
 * AFTER CALLING THIS:
 * - React Query should invalidate ["cart"] query
 * - CartSummary will show updated total with discount
 * - appliedCoupon badge will appear
 */
export const applyCoupon = (code) => {
  return api.post(CART_ENDPOINTS.APPLY_COUPON, {
    code,
  });
};

/**
 * Remove the applied coupon from the cart
 * 
 * This MODIFIES the cart:
 * 1. Removes appliedCoupon from cart document
 * 2. Recalculates cart total back to subtotal
 * 3. Returns updated cart
 * 
 * @returns {Promise} Axios response with updated cart (coupon removed)
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     _id: string (cart _id),
 *     items: [...],
 *     subtotal: number (in paise),
 *     total: number (now equals subtotal, no discount),
 *     appliedCoupon: null (cleared),
 *     itemCount: number,
 *     totalQuantity: number,
 *     status: "active" | "checkout_in_progress"
 *   }
 * }
 * 
 * BEHAVIOR:
 * - Cart.total goes back to cart.subtotal
 * - appliedCoupon field becomes null
 * - No frontend recalculation needed
 * - Can be called anytime (even if no coupon applied - returns same cart)
 * 
 * AFTER CALLING THIS:
 * - React Query should invalidate ["cart"] query
 * - CartSummary will show original total (no discount)
 * - appliedCoupon badge will disappear
 * - "Remove Coupon" button will disappear
 */
export const removeCoupon = () => {
  return api.delete(CART_ENDPOINTS.APPLY_COUPON);
};