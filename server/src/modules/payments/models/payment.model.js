/**
 * payment.model.js
 *
 * WHO CALLS IT:
 *   payment.service.js imports this model for all DB operations. No other
 *   module ever writes to Payment — Order and Coupon are CALLED BY Payment
 *   (via their existing service exports), never the reverse.
 *
 * WHY IT EXISTS:
 *   Records every payment ATTEMPT against an Order, not just the final
 *   outcome. This is a direct consequence of Business Rule 1: "One Order
 *   can have multiple payment attempts" — a failed card, a timed-out
 *   Razorpay session, and a final successful retry are three separate
 *   Payment documents sharing one orderId, not three overwrites of a
 *   single record. This also satisfies Rule 8 ("payment record must be
 *   stored permanently for auditing") — a Payment document is never
 *   deleted, only its status transitions forward.
 *
 * WHY orderId IS NOT UNIQUE (unlike Inventory's productId, Cart/Wishlist's
 * userId):
 *   Every other 1:1 relationship in this codebase enforced a unique index
 *   on the foreign key. Payment deliberately does NOT do that here — the
 *   whole point of this schema is to allow MANY Payment documents per
 *   Order. The query "find the successful payment for this order" filters
 *   on { orderId, status: 'paid' } rather than relying on a unique
 *   constraint to guarantee one record exists.
 *
 * WHY `provider` AND THE provider-PREFIXED FIELDS:
 *   providerOrderId, providerPaymentId, and providerSignature are named
 *   generically (not razorpayOrderId, etc.) so a future Stripe or PayPal
 *   integration can populate the exact same fields with that provider's
 *   own identifiers, with `provider` itself distinguishing which gateway
 *   issued them. This is what "design service layer to be
 *   provider-extensible" means at the schema level — the schema does not
 *   hardcode Razorpay-specific field names, even though Razorpay is the
 *   only provider implemented today.
 *
 * INPUT:   Raw JS object passed to `Payment.create({...})`
 * OUTPUT:  Mongoose Document instance
 */

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      // Which Order this payment attempt belongs to. Deliberately NOT
      // unique — see file header for why multiple Payment documents can
      // and do share the same orderId.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    userId: {
      // Denormalised from Order so every ownership check
      // (getMyPayments, getPaymentById) can filter directly on Payment
      // without populating Order first on every request.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Provider Abstraction ─────────────────────────────────────────────────
    provider: {
      // Which payment gateway processed this attempt. Only "razorpay" is
      // implemented today, but the enum is written to anticipate Stripe/
      // PayPal without a schema migration later.
      type: String,
      enum: {
        values: ["razorpay", "stripe", "paypal"],
        message: "{VALUE} is not a supported payment provider",
      },
      default: "razorpay",
    },

    providerOrderId: {
      // Razorpay's own order_id (created via razorpayService.createOrder,
      // a DIFFERENT concept from our own Order._id — see
      // razorpay.service.js for why these two "orders" must never be
      // confused). Required once a provider-side order has been created;
      // null only in the brief window before that call completes.
      type: String,
      default: null,
    },

    providerPaymentId: {
      // Razorpay's payment_id, returned only after the customer actually
      // completes (or fails) the checkout on Razorpay's hosted page.
      // Indexed below — this is the value Razorpay's webhook payloads use
      // to identify which payment they're reporting on.
      type: String,
      default: null,
    },

    providerSignature: {
      // The HMAC-SHA256 signature Razorpay returns alongside a successful
      // checkout, used ONLY to verify authenticity server-side — never
      // trusted at face value. See razorpay.service.js's verifySignature
      // for the actual cryptographic check. Stored here purely for audit
      // trail (Rule 8), never re-read to make a trust decision after the
      // initial verification.
      type: String,
      default: null,
    },

    transactionId: {
      // A bank/UPI-level reference number some payment methods return,
      // distinct from Razorpay's own payment_id. Optional — not every
      // payment method surfaces one.
      type: String,
      default: null,
    },

    amount: {
      // The exact amount this payment attempt is FOR, copied from
      // Order.totalAmount at the moment this Payment document is created
      // — never re-read from Order later, so a Payment record always
      // reflects what was actually charged for, even if Order data were
      // somehow to change after the fact.
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      // pending:    Payment document created, Razorpay order created,
      //             awaiting the customer to complete checkout
      // processing: Razorpay has acknowledged the attempt but final
      //             capture is not yet confirmed (rare, gateway-dependent)
      // paid:       Signature verified successfully — the ONLY status
      //             that triggers Order confirmation, Inventory
      //             finalization, and Coupon redemption (see
      //             payment.service.js's verifyPayment)
      // failed:     Verification failed or Razorpay reported failure —
      //             must NEVER touch Inventory or Coupon (Rules 6 & 7)
      // cancelled:  Customer abandoned checkout before completing payment
      // refunded:   A previously "paid" payment was refunded by an admin
      type: String,
      enum: {
        values: ["pending", "processing", "paid", "failed", "cancelled", "refunded"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      // Supports partial refunds — may be less than `amount`. Admin-only,
      // set exclusively by payment.service.js's processRefund.
      type: Number,
      default: 0,
      min: 0,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      // Captured from Razorpay's error payload (webhook or verify-time
      // failure) so admins can see WHY an attempt failed without needing
      // to cross-reference Razorpay's own dashboard.
      type: String,
      default: "",
    },

    metadata: {
      // Free-form bag for provider-specific data that doesn't warrant its
      // own named field (e.g. payment method used: card/upi/netbanking,
      // raw webhook event type). Mixed type deliberately, since different
      // providers and different webhook events carry different shapes.
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// orderId: the core query — "all payment attempts for this order" — hit
// every time an order's payment history needs review, and internally by
// payment.service.js before creating a new attempt (to check for an
// existing successful one).
paymentSchema.index({ orderId: 1 });

// userId: powers "my payments" customer-facing listing.
paymentSchema.index({ userId: 1 });

// status: powers admin dashboard filters like "all failed payments" or
// "all payments pending review."
paymentSchema.index({ status: 1 });

// providerPaymentId: THE lookup key for incoming webhook events — Razorpay
// identifies a payment by its own payment_id, so this index is what keeps
// webhook processing fast regardless of total payment volume.
paymentSchema.index({ providerPaymentId: 1 });

// createdAt: newest-first sorting on both customer and admin listings.
paymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;