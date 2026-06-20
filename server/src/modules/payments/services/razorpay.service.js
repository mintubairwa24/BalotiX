/**
 * razorpay.service.js
 *
 * WHO CALLS IT:
 *   payment.service.js exclusively. No controller, route, or any other
 *   module ever touches this file or the Razorpay SDK instance directly.
 *
 * WHY IT EXISTS AS A SEPARATE FILE (not inlined into payment.service.js):
 *   This is the ONE file in the entire Payment module that knows Razorpay
 *   exists. payment.service.js's business logic (create-then-verify-then-
 *   confirm flow, Order/Inventory/Coupon orchestration) is provider-agnostic
 *   by design — "design service layer to be provider-extensible" means a
 *   future stripe.service.js or paypal.service.js could sit alongside this
 *   file with the same three-function shape (createProviderOrder /
 *   verifySignature / fetchPaymentDetails), and payment.service.js would
 *   only need to swap which one it imports, not be rewritten.
 *
 * SECURITY BOUNDARY:
 *   The Razorpay key_secret NEVER leaves this file. It is read once from
 *   process.env at module load and used only inside the Razorpay SDK
 *   instance and the HMAC signature computation below. No function here
 *   returns the secret, logs it, or includes it in any object passed back
 *   to payment.service.js.
 *
 * INPUT/OUTPUT: documented per-function below.
 */

import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay SDK instance — constructed once at module load, reused across
// every request. key_secret is read directly from process.env and never
// stored on any object this module returns.
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay Order ────────────────────────────────────────────────────
/**
 * Creates an order on Razorpay's side, which is a DIFFERENT concept from
 * our own Order model — Razorpay requires its own order object to exist
 * before it will open a checkout session, entirely independent of our
 * e-commerce Order's lifecycle. The returned id (providerOrderId) is what
 * the frontend's Razorpay Checkout SDK needs to render the payment widget.
 *
 * WHY amount IS MULTIPLIED BY 100:
 *   Razorpay's API expects amounts in the smallest currency unit (paise
 *   for INR, matching the same "store money as an integer, never a float"
 *   discipline product.model.js already uses for price). Our own Order
 *   stores totalAmount in whole rupees, so this is the one place that
 *   conversion happens, isolated here rather than scattered across
 *   payment.service.js.
 *
 * @param {number} amount   - Order.totalAmount, in whole rupees
 * @param {string} currency - e.g. "INR"
 * @param {string} receipt  - Our own Order.orderNumber, passed through so
 *                             Razorpay's dashboard is cross-referenceable
 *                             with our own order records during support/audit
 * @returns {Object}        - { id, amount, currency } from Razorpay's API
 */
export const createRazorpayOrder = async (amount, currency, receipt) => {
  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt,
  };

  const razorpayOrder = await razorpayInstance.orders.create(options);

  return {
    id: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  };
};

// ─── Verify Razorpay Signature ───────────────────────────────────────────────
/**
 * Verify Razorpay signature.
 *
 * Never trust frontend payment success. Backend must verify cryptographic
 * signature received from Razorpay before confirming payment.
 *
 * HOW THIS WORKS:
 *   Razorpay's checkout flow returns three values to the frontend after a
 *   payment attempt: razorpay_order_id, razorpay_payment_id, and
 *   razorpay_signature. A malicious or buggy frontend could claim success
 *   and send fabricated IDs without this check. The signature is an
 *   HMAC-SHA256 hash of `${orderId}|${paymentId}`, computed by Razorpay
 *   using their key_secret — a value only Razorpay and our backend know.
 *   We independently recompute that same HMAC here using our own copy of
 *   key_secret and compare it against what the client sent. If they match,
 *   the payment genuinely came from Razorpay and was not forged client-side.
 *
 * WHY crypto.timingSafeEqual INSTEAD OF ===:
 *   A simple string comparison (===) short-circuits on the first
 *   mismatched character, meaning the time it takes to reject an invalid
 *   signature subtly leaks information about how many leading characters
 *   were correct — a timing side-channel an attacker could exploit to
 *   guess a valid signature byte-by-byte. timingSafeEqual always takes
 *   the same amount of time regardless of where the mismatch occurs,
 *   closing that channel entirely.
 *
 * @param {string} razorpayOrderId   - From the client's verify request
 * @param {string} razorpayPaymentId - From the client's verify request
 * @param {string} razorpaySignature - From the client's verify request
 * @returns {boolean}                - true only if the signature is
 *                                      cryptographically authentic
 */
export const verifySignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  // Both buffers must be the same length for timingSafeEqual to run at
  // all — an attacker-controlled signature of the wrong length would
  // throw rather than fail safely, so length is checked explicitly first.
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(razorpaySignature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

// ─── Verify Webhook Signature ────────────────────────────────────────────────
/**
 * Webhooks use a DIFFERENT signature scheme than the client-side verify
 * flow above: Razorpay signs the raw webhook request body using a
 * separate webhook secret (configured in the Razorpay dashboard, distinct
 * from key_secret), sent in the X-Razorpay-Signature header. This must be
 * checked before trusting ANY webhook payload — without it, anyone who
 * discovers the webhook URL could POST fabricated payment.captured events
 * and trigger order confirmation for orders that were never actually paid.
 *
 * @param {string} rawBody          - The raw, unparsed request body string
 * @param {string} signatureHeader  - The X-Razorpay-Signature header value
 * @returns {boolean}                - true only if the webhook is authentic
 */
export const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!signatureHeader) return false;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signatureHeader);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

// ─── Fetch Payment Details ────────────────────────────────────────────────────
/**
 * Pulls the authoritative payment record directly from Razorpay's API,
 * used by processRefund to confirm the payment is actually in a
 * refundable state before attempting one, and available for any future
 * reconciliation/audit need without re-deriving that data from our own
 * Payment document (which only stores what we chose to persist, not
 * Razorpay's full record).
 *
 * @param {string} providerPaymentId - Razorpay's payment_id
 * @returns {Object}                  - Razorpay's full payment object
 */
export const fetchPaymentDetails = async (providerPaymentId) => {
  return razorpayInstance.payments.fetch(providerPaymentId);
};

// ─── Create Refund ────────────────────────────────────────────────────────────
/**
 * Issues a refund through Razorpay's API. Supports partial refunds via
 * the optional amount parameter — omitting it refunds the full captured
 * amount. This function performs no business validation itself (e.g.
 * "has this payment already been refunded") — that belongs in
 * payment.service.js's processRefund, which reads our own Payment
 * document first. This file only ever talks to Razorpay's API surface.
 *
 * @param {string} providerPaymentId - Razorpay's payment_id to refund
 * @param {number} amount            - Optional, in whole rupees; full
 *                                      refund if omitted
 * @returns {Object}                  - Razorpay's refund object
 */
export const createRefund = async (providerPaymentId, amount) => {
  const options = {};
  if (amount !== undefined) {
    options.amount = Math.round(amount * 100);
  }

  return razorpayInstance.payments.refund(providerPaymentId, options);
};