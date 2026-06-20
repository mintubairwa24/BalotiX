/**
 * webhook.service.js
 *
 * WHO CALLS IT:
 *   payment.controller.js's handleWebhook, mounted on POST
 *   /api/payments/webhook — the one route in this entire module Razorpay
 *   itself calls directly, server-to-server, with no customer browser
 *   involved.
 *
 * WHY THIS IS A SEPARATE FILE FROM payment.service.js:
 *   Webhooks are an entirely different trust and reliability model from
 *   the customer-facing verifyPayment flow. verifyPayment trusts a
 *   request that originated from an authenticated customer's browser,
 *   gated by requireAuth. A webhook has no authenticated user at all —
 *   its only proof of authenticity is the X-Razorpay-Signature header,
 *   verified against the RAW unparsed body (not the parsed JSON), which
 *   is why payment.routes.js mounts this endpoint with raw-body parsing
 *   rather than express.json(). Webhooks can also arrive MULTIPLE TIMES
 *   for the same event (Razorpay retries on timeout) and can arrive
 *   OUT OF ORDER relative to the customer's own verify call — both
 *   requiring idempotency handling that the synchronous verify flow does
 *   not need.
 *
 * WHY THIS EXISTS AT ALL (alongside verifyPayment):
 *   verifyPayment depends on the customer's browser successfully calling
 *   back to our API after Razorpay's checkout completes. If the customer
 *   closes the tab, loses connectivity, or the browser crashes right
 *   after paying, verifyPayment never runs — but the payment genuinely
 *   succeeded on Razorpay's side. The webhook is the safety net that
 *   ensures the Order still gets confirmed even when the synchronous
 *   client-side flow never completes.
 *
 * INPUT:   Raw request body (string) + the X-Razorpay-Signature header
 * OUTPUT:  void — this function's job is to apply side effects
 *          (confirm Order / mark Payment failed), not return data to an
 *          HTTP response in any meaningful way; the controller always
 *          responds 200 regardless, per Razorpay's own retry semantics
 */

import Payment from "../models/payment.model.js";
import Order from "../../orders/models/order.model.js";
import * as orderService from "../../orders/services/order.service.js";
import * as couponService from "../../coupons/services/coupon.service.js";
import * as razorpayService from "./razorpay.service.js";
import * as paymentService from "./payment.service.js";

// ─── Process Incoming Webhook ────────────────────────────────────────────────
/**
 * Entry point called by payment.controller.js for every incoming webhook
 * POST. Verifies the webhook signature first — unconditionally, before
 * branching on event type — since an unverified payload must never reach
 * any business logic regardless of what event type it claims to be.
 *
 * SUPPORTED EVENTS:
 *   payment.captured  -> confirms the Order (same effect as a successful
 *                         verifyPayment call), but only if not already paid
 *   payment.failed    -> marks the corresponding Payment as failed,
 *                         touching nothing else (Rules 6 & 7)
 *   refund.created    -> records that a refund was initiated
 *   refund.processed  -> records that a refund completed
 *
 * Unknown event types are logged and ignored rather than throwing — a
 * webhook endpoint must stay resilient to Razorpay adding new event types
 * in the future without that breaking this integration.
 *
 * @param {string} rawBody         - The raw, unparsed request body
 * @param {string} signatureHeader - The X-Razorpay-Signature header value
 * @param {Object} parsedPayload   - The same body, already JSON-parsed,
 *                                    passed separately since signature
 *                                    verification needs the raw string but
 *                                    event handling needs structured access
 */
export const processWebhookEvent = async (
  rawBody,
  signatureHeader,
  parsedPayload
) => {
  // Unconditional first step — no event-specific logic runs before this
  // passes. See razorpay.service.js's verifyWebhookSignature for why this
  // uses a different secret/scheme than the client-side verify flow.
  const isValid = razorpayService.verifyWebhookSignature(
    rawBody,
    signatureHeader
  );

  if (!isValid) {
    const error = new Error("Invalid webhook signature");
    error.statusCode = 400;
    throw error;
  }

  const eventType = parsedPayload.event;

  switch (eventType) {
    case "payment.captured":
      await handlePaymentCaptured(parsedPayload);
      break;

    case "payment.failed":
      await handlePaymentFailed(parsedPayload);
      break;

    case "refund.created":
    case "refund.processed":
      await handleRefundEvent(parsedPayload, eventType);
      break;

    default:
      // Intentionally a no-op, not an error — see doc comment above.
      break;
  }
};

// ─── Handle payment.captured ──────────────────────────────────────────────────
/**
 * Not exported. The webhook equivalent of verifyPayment's success path.
 *
 * IDEMPOTENCY: checks the local Payment's current status before doing
 * anything. If it is already "paid" (meaning the customer's own
 * verifyPayment call already completed this exact confirmation), this
 * function does nothing further — Order.confirmed and Coupon.redeemCoupon
 * must each only ever fire ONCE per order, and re-running them for a
 * duplicate or late-arriving webhook would attempt to confirm an
 * already-confirmed order or redeem an already-redeemed coupon, both of
 * which the underlying service functions correctly reject — but the
 * cleaner, intended behavior is to recognize the duplicate here and skip
 * silently rather than relying on a downstream error to swallow it.
 *
 * @param {Object} payload - Razorpay's payment.captured event payload
 */
const handlePaymentCaptured = async (payload) => {
  const providerPaymentId = payload.payload.payment.entity.id;
  const providerOrderId = payload.payload.payment.entity.order_id;

  const payment = await Payment.findOne({
    providerOrderId,
    providerPaymentId: { $in: [providerPaymentId, null] },
  });

  if (!payment) return; // No local record — nothing to reconcile

  if (payment.status === "paid") return; // Already confirmed — idempotent no-op

  payment.status = "paid";
  payment.providerPaymentId = providerPaymentId;
  payment.paidAt = new Date();
  await payment.save();

  const order = await Order.findById(payment.orderId);

  if (!order || order.status !== "pending") {
    // Order already confirmed by the customer's own verifyPayment call,
    // or in some other state the webhook should not override — stop here.
    return;
  }

  // Same Order-confirmation call verifyPayment uses — finalizes Inventory
  // via Order's own existing transition logic.
  await orderService.updateOrderStatus(order._id, "confirmed", order.userId);

  // Coupon redemption, mirroring verifyPayment's success branch exactly —
  // only reached here if the customer's own verify call never completed
  // and this webhook is the first thing to confirm the order.
  if (order.appliedCoupon) {
    await couponService.redeemCoupon(
      order.appliedCoupon.couponId,
      order.userId,
      order._id,
      order.appliedCoupon.discountAmount
    );
  }
};

// ─── Handle payment.failed ─────────────────────────────────────────────────────
/**
 * Not exported. Delegates to payment.service.js's handlePaymentFailure,
 * which already implements the "touch nothing but the Payment document"
 * rule (Rules 6 & 7) — reused here rather than duplicated.
 *
 * @param {Object} payload - Razorpay's payment.failed event payload
 */
const handlePaymentFailed = async (payload) => {
  const providerPaymentId = payload.payload.payment.entity.id;
  const reason =
    payload.payload.payment.entity.error_description || "Payment failed";

  await paymentService.handlePaymentFailure(providerPaymentId, reason);
};

// ─── Handle refund.created / refund.processed ────────────────────────────────
/**
 * Not exported. Records refund event metadata on the local Payment
 * document for audit visibility. Does NOT itself call
 * razorpayService.createRefund (that is the OUTBOUND direction, triggered
 * by an admin via paymentService.processRefund) — this is purely the
 * INBOUND acknowledgement that a refund Razorpay already knows about has
 * changed state.
 *
 * @param {Object} payload   - Razorpay's refund event payload
 * @param {string} eventType - "refund.created" | "refund.processed"
 */
const handleRefundEvent = async (payload, eventType) => {
  const providerPaymentId = payload.payload.refund.entity.payment_id;

  const payment = await Payment.findOne({ providerPaymentId });
  if (!payment) return;

  payment.metadata = {
    ...payment.metadata,
    lastWebhookRefundEvent: eventType,
    lastWebhookRefundAt: new Date(),
  };
  await payment.save();
};