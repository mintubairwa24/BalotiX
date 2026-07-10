/**
 * src/services/order.service.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all Order backend API interactions related to checkout.
 * This is the ONLY place that talks to the Order creation endpoint.
 * 
 * Reused/extended by:
 * - Phase 12: Checkout flow (useCheckout hook)
 * - Phase 13: Orders module (order history, order details) — will extend this
 *   file further with getOrders(), getOrderById(), cancelOrder(), etc.
 * 
 * BACKEND CONTRACT:
 * The backend Order module creates an order FROM the user's current cart.
 * The cart already contains:
 *   - items (with locked price snapshots)
 *   - appliedCoupon (if any, Phase 10)
 *   - subtotal / total (calculated server-side)
 * 
 * The frontend does NOT send cart items or totals — it only sends the
 * shippingAddressId. The backend reads the authenticated user's active
 * cart, validates it (stock, checkout lock via checkoutStart from Phase 9),
 * and converts it into an Order document.
 * 
 * CRITICAL RULES:
 * 1. Service functions NEVER touch React state
 * 2. Service functions ALWAYS return the full Axios response
 * 3. Frontend NEVER calculates order totals — backend is single source of truth
 * 4. This phase does NOT create/verify payment — order is created in a
 *    "pending payment" style state and the UI redirects to a payment
 *    page stub. Payment gateway integration is a future phase.
 * 
 * FLOW (Phase 9 → Phase 12):
 * 1. useCheckoutStart() (Phase 9, cart.service.js) locks the cart and
 *    reserves stock — this MUST be called before showing the checkout page
 *    (already wired into CheckoutPage in this phase).
 * 2. User reviews cart/address/coupon on CheckoutPage.
 * 3. User clicks "Place Order" → createOrder(shippingAddressId) is called.
 * 4. Backend creates the Order from the locked cart.
 * 5. Frontend redirects to CheckoutSuccessRedirect → payment page (stub).
 */

import  api  from "../api/axios";

// Order API endpoints
// IMPORTANT: These paths should match your backend Order module.
// If your backend uses different paths, update these constants only —
// no component changes required.
const ORDER_ENDPOINTS = {
  CREATE: "/orders",              // POST - create order from current cart
  GET_ALL: "/orders",             // GET - list user's orders (future phase)
  GET_BY_ID: (id) => `/orders/${id}`, // GET - single order detail (future phase)
};

/**
 * Create a new order from the user's current (locked) cart
 * 
 * This is the CORE checkout action. It converts the active cart into
 * a persisted Order record on the backend.
 * 
 * @param {Object} orderData
 * @param {string} orderData.shippingAddressId - MongoDB _id of selected address
 * 
 * @returns {Promise} Axios response with created order
 * 
 * REQUEST SHAPE:
 * {
 *   shippingAddressId: string
 * }
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     _id: string (order _id),
 *     orderNumber: string (e.g., "NEX-000123"),
 *     items: [...],              // snapshot of cart items at order time
 *     shippingAddress: {...},    // snapshot of selected address
 *     appliedCoupon: {...} | null,
 *     subtotal: number (paise),
 *     discountAmount: number (paise),
 *     total: number (paise),
 *     status: "pending_payment" | "confirmed" | ...,
 *     createdAt: ISO timestamp
 *   }
 * }
 * 
 * IMPORTANT:
 * - Backend re-validates the cart (stock, checkout lock) before creating order
 * - Backend snapshots item prices, address, and coupon into the order
 *   (so later price/address changes don't affect existing orders)
 * - This endpoint does NOT process payment
 * - After success, cart is typically cleared/reset by the backend
 * 
 * ERRORS:
 * - 400: Missing/invalid shippingAddressId
 * - 400: Cart is empty
 * - 404: Address not found
 * - 409: Cart not locked (checkout not started) or stock changed
 * 
 * AFTER CALLING:
 * - React Query should invalidate ["cart"] (cart is now consumed)
 * - Frontend redirects to payment page stub with the new order's _id
 */
export const createOrder = (orderData) => {
  return api.post(ORDER_ENDPOINTS.CREATE, orderData);
};

/**
 * Fetch all orders for current user
 * 
 * PLACEHOLDER for Phase 13 (Orders module).
 * Included now only so future phases extend this file rather than
 * creating a duplicate service.
 * 
 * @returns {Promise} Axios response with array of orders
 */
export const getOrders = () => {
  return api.get(ORDER_ENDPOINTS.GET_ALL);
};

/**
 * Fetch single order by ID
 * 
 * PLACEHOLDER for Phase 13 (Order details) and the payment page stub
 * in this phase (to display order number/total before redirecting).
 * 
 * @param {string} orderId - MongoDB _id of order
 * @returns {Promise} Axios response with order details
 */
export const getOrderById = (orderId) => {
  return api.get(ORDER_ENDPOINTS.GET_BY_ID(orderId));
};