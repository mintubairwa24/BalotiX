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

const ORDER_ENDPOINTS = {
  CREATE: "/orders",
  GET_ALL: "/orders",          // Admin: GET /api/orders?page=&limit=&status=&paymentStatus=&search=&sortBy=&sortOrder=
  GET_MY_ORDERS: "/orders/my-orders", // Customer: GET /api/orders/my-orders
  GET_BY_ID: (id) => `/orders/${id}`,
  CANCEL: (id) => `/orders/${id}/cancel`,
  UPDATE_STATUS: (id) => `/orders/${id}/status`,
};
 
/**
 * Create a new order from the user's current (locked) cart
 * (Unchanged from Phase 12 — included here for completeness since this
 * is the same file.)
 */
export const createOrder = (orderData) => {
  return api.post(ORDER_ENDPOINTS.CREATE, orderData);
};
 
/**
 * Fetch a paginated list of the current user's orders
 * 
 * @param {Object} params
 * @param {number} params.page - 1-indexed page number
 * @param {number} params.limit - orders per page
 * 
 * @returns {Promise} Axios response with orders + pagination metadata
 * 
 * RESPONSE SHAPE (assumed — adjust if backend differs):
 * {
 *   success: true,
 *   data: {
 *     orders: [
 *       {
 *         _id, orderNumber, status, total, itemCount,
 *         createdAt, paymentStatus
 *       },
 *       ...
 *     ],
 *     pagination: {
 *       page: number,
 *       limit: number,
 *       totalOrders: number,
 *       totalPages: number
 *     }
 *   }
 * }
 * 
 * WHEN TO CALL:
 * - OrdersPage on mount and on page change
 */
export const getOrders = (params = { page: 1, limit: 10 }) => {
  return api.get(ORDER_ENDPOINTS.GET_ALL, { params });
};
 
/**
 * Fetch full details for a single order
 * (Unchanged from Phase 12 signature — now actually used by
 * OrderDetailsPage in addition to PaymentPage.)
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     _id, orderNumber, status, paymentStatus,
 *     items: [{ productId, name, image, effectivePrice, quantity, lineTotal }],
 *     shippingAddress: { fullName, phoneNumber, addressLine1, ... },
 *     appliedCoupon: { code, discountAmount, discountPercentage } | null,
 *     subtotal, discountAmount, total,
 *     paymentId, paymentMethod,
 *     statusHistory: [{ status, timestamp }]  // used by OrderTimeline, if backend provides it
 *     createdAt, updatedAt
 *   }
 * }
 */
export const getOrderById = (orderId) => {
  return api.get(ORDER_ENDPOINTS.GET_BY_ID(orderId));
};
 
/**
 * Cancel an order
 * 
 * ONLY called if the backend supports cancellation for the order's
 * current status (typically only "pending_payment" or "confirmed"
 * orders are cancellable — NOT "shipped"/"delivered"). The UI
 * (OrderDetailsPage) is responsible for only showing the cancel action
 * when order.status is in an allowed set — this function does not
 * enforce that itself, since the backend is the actual authority and
 * will reject invalid transitions regardless.
 * 
 * @param {string} orderId
 * @returns {Promise} Axios response with updated order
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: { _id, status: "cancelled", ... }
 * }
 * 
 * ERRORS:
 * - 400: Order cannot be cancelled in its current status
 * - 404: Order not found
 * - 403: Order belongs to a different user
 */
export const cancelOrder = (orderId) => {
  return api.patch(ORDER_ENDPOINTS.CANCEL(orderId));
};

/**
 * Update order status (admin only)
 * 
 * PATCH /api/orders/:id/status
 * Body: { status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" }
 * 
 * @param {string} orderId
 * @param {string} status - New status value
 * @returns {Promise} Axios response
 */
export const updateOrderStatus = (orderId, status) => {
  return api.patch(ORDER_ENDPOINTS.UPDATE_STATUS(orderId), { status });
};
