/**
 * src/services/payment.service.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all Payment backend API interactions for Razorpay checkout.
 * This is the ONLY file that constructs requests to the Payment module.
 * 
 * Reused/extended by:
 * - Phase 13: Payment flow (usePayment hook, RazorpayCheckout component)
 * - Future: Order details page (Phase 13/future) showing payment status
 * 
 * BACKEND CONTRACT (Razorpay flow):
 * 1. Frontend asks backend to create a payment session for an existing
 *    Order (created in Phase 12). Backend creates a Razorpay Order via
 *    the Razorpay server SDK and returns the details needed to open the
 *    Razorpay Checkout modal (razorpayOrderId, amount, currency, keyId).
 * 2. Frontend opens Razorpay's own hosted checkout modal using those
 *    details. The user completes payment INSIDE Razorpay's UI — NexCart
 *    never sees card/UPI details.
 * 3. Razorpay's modal returns a response object to the frontend
 *    (razorpay_payment_id, razorpay_order_id, razorpay_signature).
 * 4. Frontend forwards this EXACT response to the backend's verify
 *    endpoint. The backend — and ONLY the backend — validates the
 *    signature using the Razorpay secret key and updates the order's
 *    payment status.
 * 
 * CRITICAL SECURITY RULES (see also usePayment.js and RazorpayCheckout):
 * 1. This file NEVER computes or checks a Razorpay signature — that
 *    requires the Razorpay secret key, which must never exist in
 *    frontend code or bundles.
 * 2. This file NEVER stores or reads a Razorpay secret key.
 * 3. The only Razorpay credential used on the frontend is the PUBLIC
 *    key_id returned by createPaymentSession() — safe to expose, it's
 *    designed to be embedded in client-side checkout widgets.
 * 4. Service functions NEVER touch React state and ALWAYS return the
 *    full Axios response — hooks extract response.data.data.
 */

import  api  from "../api/axios";

// Payment API endpoints
// IMPORTANT: These paths follow the same naming convention as
// CART_ENDPOINTS/ORDER_ENDPOINTS. If your backend's Payment module uses
// different paths, update ONLY this object — no other file changes needed.
const PAYMENT_ENDPOINTS = {
  CREATE_SESSION: "/payment/create",     // POST - create Razorpay order for an existing Order
  VERIFY: "/payment/verify",           // POST - forward Razorpay response for backend verification
  GET_STATUS: (orderId) => `/payment/status/${orderId}`, // GET - current payment status for an order
};

/**
 * Create a Razorpay payment session for an existing order
 * 
 * Called when the user lands on PaymentPage and clicks "Pay Now".
 * The backend creates a corresponding Razorpay Order (via Razorpay's
 * server-side SDK) and returns everything needed to open the Razorpay
 * Checkout modal.
 * 
 * @param {string} orderId - MongoDB _id of the NexCart order (created in Phase 12)
 * 
 * @returns {Promise} Axios response with Razorpay session details
 * 
 * REQUEST SHAPE:
 * { orderId: string }
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     razorpayOrderId: string,   // Razorpay's own order id (order_xxxxx)
 *     amount: number,            // amount in paise (matches order.total)
 *     currency: string,          // e.g. "INR"
 *     keyId: string,             // Razorpay PUBLIC key — safe for frontend
 *     orderId: string            // echo of NexCart order _id, for reference
 *   }
 * }
 * 
 * IMPORTANT:
 * - amount/currency are backend-calculated from the order, never
 *   constructed on the frontend
 * - keyId is the Razorpay PUBLISHABLE key (safe to expose) — this is
 *   NOT the secret key used for signature verification
 * 
 * ERRORS:
 * - 404: Order not found
 * - 400: Order already paid / not in a payable state
 * - 403: Order belongs to a different user
 */
export const createPaymentSession = (orderId) => {
  return api.post(PAYMENT_ENDPOINTS.CREATE_SESSION, { orderId });
};

/**
 * Forward Razorpay's checkout response to the backend for verification
 * 
 * This is called from Razorpay Checkout's `handler` callback, immediately
 * after the user completes payment inside the Razorpay modal.
 * 
 * @param {Object} verificationData
 * @param {string} verificationData.orderId - NexCart order _id
 * @param {string} verificationData.razorpay_order_id - From Razorpay response
 * @param {string} verificationData.razorpay_payment_id - From Razorpay response
 * @param {string} verificationData.razorpay_signature - From Razorpay response
 * 
 * @returns {Promise} Axios response with verification result
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     orderId: string,
 *     paymentStatus: "paid",
 *     orderStatus: "confirmed",
 *     paymentId: string
 *   }
 * }
 * 
 * SECURITY:
 * This function is a pure pass-through. It does NOT inspect, validate,
 * or compute anything about the signature — it simply relays exactly
 * what Razorpay's modal returned. The backend re-derives the expected
 * signature using the Razorpay SECRET key (server-side only) and
 * compares it. If verification fails, the backend returns an error and
 * the frontend routes to PaymentFailedPage — the frontend has no way to
 * (and must never attempt to) determine validity itself.
 * 
 * ERRORS:
 * - 400: Signature verification failed (tampering or mismatch)
 * - 404: Order not found
 * - 409: Order already verified/paid
 */
export const verifyPayment = (verificationData) => {
  return api.post(PAYMENT_ENDPOINTS.VERIFY, verificationData);
};

/**
 * Get the current payment status for an order
 * 
 * Used by PaymentPage on load to check if a payment was already
 * completed (e.g. user refreshed the page after paying, or returned
 * via browser back button), and by PaymentSuccessPage/PaymentFailedPage
 * to confirm the final state rather than trusting only client-side
 * navigation state.
 * 
 * @param {string} orderId - MongoDB _id of the order
 * 
 * @returns {Promise} Axios response with payment status
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     orderId: string,
 *     paymentStatus: "pending" | "paid" | "failed",
 *     orderStatus: string,
 *     total: number (paise),
 *     orderNumber: string
 *   }
 * }
 */
export const getPaymentStatus = (orderId) => {
  return api.get(PAYMENT_ENDPOINTS.GET_STATUS(orderId));
};