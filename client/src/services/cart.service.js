/**
 * src/services/cart.service.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all Cart backend API interactions. This service is the single source of truth
 * for Cart operations and will be reused by:
 * - Phase 9: Cart UI (useCart hook, CartPage, MiniCart)
 * - Phase 10: Checkout flow (checkout/start, confirm, abandon)
 * - Phase 11: Orders module (order history, order detail)
 * 
 * BACKEND CONTRACT:
 * The backend Cart module implements atomic operations with validation:
 * - Cart items are immutable once checkout_in_progress
 * - Stock reservations are managed server-side
 * - Coupons are validated per cart state
 * - All responses follow the standard API shape: { success, message, data }
 * 
 * CRITICAL RULES:
 * 1. Service functions NEVER touch React state
 * 2. Service functions ALWAYS return the full Axios response
 * 3. React Query hooks extract: response.data.data (see useCart for pattern)
 * 4. Checkout lock (cart.status === "checkout_in_progress") is enforced by backend
 *    - Frontend MUST respect this and disable UI controls
 *    - Do NOT bypass this lock in the frontend
 * 
 * PRICE HANDLING:
 * - Cart total/subtotal are always in PAISE
 * - Frontend NEVER performs arithmetic on prices (backend owns that logic)
 * - Display: ₹${Number(paise).toLocaleString("en-IN")}
 */

import api from "../api/axios";
import { CART_ENDPOINTS } from "../api/endpoints";

/**
 * Get current user's active cart
 * 
 * @returns {Promise} Axios response with cart data
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     _id: string,
 *     userId: string,
 *     status: "active" | "checkout_in_progress",
 *     items: [...],
 *     itemCount: number (VIRTUAL - distinct line items),
 *     totalQuantity: number (VIRTUAL - sum of quantities),
 *     subtotal: number (VIRTUAL - in paise),
 *     total: number (VIRTUAL - in paise, after coupon if applied),
 *     appliedCoupon: { couponId, code, discountAmount } | null
 *   }
 * }
 * 
 * WHEN TO CALL:
 * - On app initialization (via useCart in a Provider)
 * - After adding/removing/updating items
 * - After applying/removing coupon
 * - React Query will dedupe with staleTime: 0
 */
export const getCart = () => {
  return api.get(CART_ENDPOINTS.GET);
};

/**
 * Add a product to the cart
 * 
 * @param {string} productId - MongoDB product _id
 * @param {number} quantity - Quantity to add (default 1)
 * 
 * @returns {Promise} Axios response with updated cart
 * 
 * IMPORTANT:
 * - If product is already in cart, this increases quantity
 * - If cart.status === "checkout_in_progress", backend returns 409
 * - Stock validation happens on backend
 * 
 * ERRORS:
 * - 409: Cart is locked (checkout in progress) - show "Complete or cancel checkout first"
 * - 400: Product not found or out of stock
 */
export const addToCart = (productId, quantity = 1) => {
  return api.post(CART_ENDPOINTS.ADD_ITEM, {
    productId,
    quantity,
  });
};

/**
 * Update quantity of an item in cart
 * 
 * @param {string} productId - MongoDB product _id
 * @param {number} quantity - New quantity (must be > 0)
 * 
 * @returns {Promise} Axios response with updated cart
 * 
 * IMPORTANT:
 * - If quantity = 0, backend removes the item (or use removeFromCart)
 * - If cart.status === "checkout_in_progress", backend returns 409
 * - Stock validation happens on backend
 */
export const updateCartQuantity = (productId, quantity) => {
  return api.put(`${CART_ENDPOINTS.UPDATE_ITEM}/${productId}`, {
    quantity,
  });
};

/**
 * Remove a product from cart
 * 
 * @param {string} productId - MongoDB product _id
 * 
 * @returns {Promise} Axios response with updated cart
 * 
 * IMPORTANT:
 * - If cart.status === "checkout_in_progress", backend returns 409
 */
export const removeFromCart = (productId) => {
  return api.delete(`${CART_ENDPOINTS.DELETE_ITEM}/${productId}`);
};

/**
 * Clear entire cart
 * 
 * @returns {Promise} Axios response
 * 
 * IMPORTANT:
 * - If cart.status === "checkout_in_progress", backend returns 409
 * - Clears all items AND applied coupons
 */
export const clearCart = () => {
  return api.delete(CART_ENDPOINTS.CLEAR);
};

/**
 * Validate and preview a coupon (no side effects)
 * 
 * @param {string} code - Coupon code to validate
 * 
 * @returns {Promise} Axios response with discount preview
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     couponId: string,
 *     code: string,
 *     discountAmount: number (in paise),
 *     discountPercentage: number,
 *     message: string
 *   }
 * }
 * 
 * IMPORTANT:
 * - This is validation-only, does NOT apply the coupon
 * - No side effects on cart
 * - Use this for "Preview discount" or validation feedback
 * - Backend will return error with message if invalid/expired/not applicable
 */
export const validateCoupon = (code) => {
  return api.post(CART_ENDPOINTS.VALIDATE_COUPON, {
    code,
  });
};

/**
 * Apply a validated coupon to cart
 * 
 * @param {string} code - Coupon code to apply
 * 
 * @returns {Promise} Axios response with updated cart (total reduced)
 * 
 * IMPORTANT:
 * - Must be validated first with validateCoupon
 * - Backend checks eligibility (min amount, customer restrictions, etc.)
 * - Cart.total will reflect the discount
 * - Only ONE coupon per cart
 */
export const applyCoupon = (code) => {
  return api.post(CART_ENDPOINTS.APPLY_COUPON, {
    code,
  });
};

/**
 * Remove applied coupon from cart
 * 
 * @returns {Promise} Axios response with updated cart (total back to subtotal)
 */
export const removeCoupon = () => {
  return api.delete(CART_ENDPOINTS.APPLY_COUPON);
};

/**
 * Start checkout process
 * 
 * This endpoint:
 * 1. Locks the cart (status = "checkout_in_progress")
 * 2. Reserves stock for all items
 * 3. Validates coupon one final time
 * 4. Returns final order total
 * 
 * @returns {Promise} Axios response
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     orderId: string (MongoDB _id),
 *     orderNumber: string ("ORD-2026-000001"),
 *     status: "pending_payment",
 *     total: number (in paise),
 *     items: [...],
 *     paymentDetails: { ... }
 *   }
 * }
 * 
 * AFTER CALLING THIS:
 * - Cart is LOCKED - quantity/remove disabled
 * - Stock IS RESERVED (timeout 30 min if payment not confirmed)
 * - Must call checkoutConfirm or checkoutAbandon next
 * 
 * ERRORS:
 * - 400: Out of stock (after lock attempt)
 * - 400: Coupon expired/invalid at checkout
 * - 400: Empty cart
 */
export const checkoutStart = () => {
  return api.post(CART_ENDPOINTS.CHECKOUT_START);
};

/**
 * Confirm checkout after payment success
 * 
 * This endpoint:
 * 1. Validates payment receipt
 * 2. Finalizes order
 * 3. Clears cart
 * 4. Creates notification
 * 5. Releases any over-reserved stock
 * 
 * @param {string} paymentId - Razorpay payment_id
 * @param {string} signature - Razorpay signature
 * 
 * @returns {Promise} Axios response
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     order: { _id, orderNumber, status: "confirmed", items, total },
 *     cart: { items: [] } (cart is cleared)
 *   }
 * }
 * 
 * AFTER CALLING THIS:
 * - Order created in Orders module
 * - Cart cleared
 * - Stock reserved quantity deducted
 * - Customer notified
 * - Redirect to OrderConfirmationPage with orderNumber
 */
export const checkoutConfirm = (paymentId, signature) => {
  return api.post(CART_ENDPOINTS.CHECKOUT_CONFIRM, {
    paymentId,
    signature,
  });
};

/**
 * Abandon/cancel current checkout
 * 
 * This endpoint:
 * 1. Releases reserved stock
 * 2. Unlocks cart
 * 3. Restores items (does NOT clear cart)
 * 
 * @returns {Promise} Axios response with unlocked cart
 * 
 * AFTER CALLING THIS:
 * - Cart status back to "active"
 * - Quantity/remove controls re-enabled
 * - Customer can continue shopping
 */
export const checkoutAbandon = () => {
  return api.post(CART_ENDPOINTS.CHECKOUT_ABANDON);
};