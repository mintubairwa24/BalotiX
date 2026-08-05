/**
 * order.model.js
 *
 * WHO CALLS IT:
 *   order.service.js imports this model for all DB operations. No other
 *   module ever writes to Order — it is the convergence point every prior
 *   module's teaching phase deferred toward (Cart's checkoutRef, Coupon's
 *   orderRef on CouponRedemption), but nothing downstream depends on it yet.
 *
 * WHY IT EXISTS:
 *   Represents a committed purchase, created BEFORE payment completes.
 *   This is a deliberate business rule: the Order document exists the
 *   moment checkout begins, in "pending" status, not after payment
 *   succeeds. Payment confirmation later transitions status, it does not
 *   create the record.
 *
 * WHY TOTALS ARE STORED, NOT COMPUTED:
 *   Unlike Cart's subtotal/total (computed virtuals, always reflecting
 *   live snapshot prices), Order's subtotal/discountAmount/totalAmount are
 *   stored as plain Numbers, fixed once at creation. This is intentional:
 *   "order totals must never depend on future Product price changes." A
 *   virtual recalculated from OrderItem on every read would defeat that
 *   guarantee the moment OrderItem's own snapshot logic had any bug —
 *   storing the resolved total directly removes that dependency entirely.
 *
 * WHY appliedCoupon IS DUPLICATED HERE (already exists on Cart):
 *   Cart.appliedCoupon is provisional and mutable — a customer can remove
 *   it before checkout. Order.appliedCoupon is the frozen record of
 *   exactly what was applied at the moment THIS order was created. Once
 *   written, it never changes, regardless of what happens to the
 *   originating Coupon document afterward (rate changed, deactivated, etc).
 *
 * INPUT:   Raw JS object passed to `Order.create({...})`
 * OUTPUT:  Mongoose Document instance
 */

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      // Human-readable identifier shown to customers and support staff,
      // e.g. "ORD-2026-000001". Generated atomically by
      // order.service.js's generateOrderNumber() via OrderCounter —
      // never assigned here, since Mongoose schema defaults cannot
      // perform the atomic increment this format requires.
      type: String,
      required: true,
    //   unique: true,
      trim: true,
    },

    userId: {
      // The customer who placed this order. Every ownership check in
      // order.service.js (getOrderById, cancelOrder) compares this field
      // against the authenticated requester's _id.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartRef: {
      // Which Cart this order was created from. Mainly for traceability/
      // debugging — Order does not read live data from Cart after
      // creation, since all pricing is frozen into subtotal/totalAmount
      // and OrderItem snapshots.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },

    subtotal: {
      // Cart's subtotal AT THE MOMENT OF ORDER CREATION, copied verbatim
      // from cart.subtotal (itself built from CartItem.priceSnapshot
      // values, never a live Product price). Stored, not recomputed, so
      // this number can never drift if Product prices change later.
      type: Number,
      required: true,
      min: 0,
    },

    discountAmount: {
      // The exact rupee amount the applied coupon subtracted, frozen at
      // creation time. Mirrors appliedCoupon.discountAmount below but
      // kept as its own top-level field so totalAmount = subtotal -
      // discountAmount is readable without unpacking the nested object.
      type: Number,
      default: 0,
      min: 0,
    },

    appliedCoupon: {
      // Snapshot of whichever coupon was active on the cart at order
      // creation, or null if none was applied. See file header for why
      // this is a frozen copy rather than a live reference back to Cart.
      type: {
        couponId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Coupon",
        },
        code: String,
        discountAmount: Number,
      },
      default: null,
    },

    totalAmount: {
      // Final amount owed: subtotal - discountAmount, clamped to a
      // non-negative floor by order.service.js's createOrderFromCart.
      // This is the single number a future Payments module should charge
      // against — never recompute it from subtotal/discountAmount at
      // payment time, since this stored value IS the authoritative total.
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      // Frozen snapshot of the address selected at checkout time. This is
      // intentionally copied into the order rather than left as a live
      // reference to the user's address book so the shipment destination
      // remains immutable after order creation.
      label: { type: String, default: "" },
      fullName: { type: String, required: true, trim: true },
      phoneNumber: { type: String, required: true, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, default: "", trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      isDefault: { type: Boolean, default: false },
    },

    status: {
      // The order's fulfilment lifecycle, independent of paymentStatus —
      // an order can be "confirmed" while paymentStatus is still "pending"
      // briefly, or "cancelled" regardless of payment state. Terminal
      // states (delivered/cancelled/refunded) are enforced by
      // order.service.js's updateOrderStatus to never transition further.
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
          "refunded",
        ],
        message: "{VALUE} is not a valid order status",
      },
      default: "pending",
    },

    paymentStatus: {
      // Tracks money separately from fulfilment. Deliberately a distinct
      // field from `status` rather than folding payment states into the
      // same enum — "confirmed but payment failed" and "shipped but
      // refund pending" are both valid real-world combinations that a
      // single combined enum could not express cleanly.
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "pending",
    },

    // ── Cancellation Audit Fields ─────────────────────────────────────────────
    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      // Whoever triggered the cancellation — the customer themselves
      // (self-service cancelOrder) or an admin (updateOrderStatus
      // transitioning to "cancelled"). Distinguishing who acted matters
      // for support/audit history.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // ── Status Change Audit ───────────────────────────────────────────────────
    statusUpdatedBy: {
      // The admin who most recently changed `status` via updateOrderStatus.
      // Null while status is still its initial "pending" default, since
      // creation itself is not a "status update" in the audit sense.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// orderNumber: unique — hit whenever a customer or support agent looks up
// an order by its human-readable number rather than MongoDB _id.
orderSchema.index({ orderNumber: 1 }, { unique: true });

// userId: powers "my orders" lookups — every customer-facing list query
// filters by this field first.
orderSchema.index({ userId: 1 });

// status: powers admin dashboard filters like "all pending orders" or
// "all shipped orders" without a full collection scan.
orderSchema.index({ status: 1 });

// createdAt: for newest-first sorting on both customer and admin listings.
orderSchema.index({ createdAt: -1 });

// userId + createdAt: compound — covers the exact shape of the "my
// orders, newest first" query in one index rather than two separate
// single-field indexes that Mongo would otherwise have to intersect.
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
