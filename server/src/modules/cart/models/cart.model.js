/**
 * cart.model.js
 *
 * WHO CALLS IT:
 *   cart.service.js imports this model for all DB operations. No other
 *   module ever writes to Cart — it is the leaf of the dependency chain,
 *   consuming Product and Inventory but never being consumed by them.
 *
 * WHY IT EXISTS:
 *   Holds one customer's in-progress purchase intent. Unlike Product or
 *   Category, Cart documents are short-lived and cyclic — they never reach
 *   an "archived" terminal state, they just empty and refill indefinitely.
 *
 * EMBEDDING DECISION:
 *   Cart items are embedded subdocuments, not a separate collection. A real
 *   cart holds single/low-double-digit line items — nowhere near the
 *   document-growth concern that ruled out embedding products inside
 *   Category. Embedding means "get my cart" is one query, which matters
 *   because this is one of the most frequently hit reads in the app.
 *
 * SNAPSHOT DECISION:
 *   Each item stores priceSnapshot and nameSnapshot captured at add-time.
 *   This mirrors the snapshot pattern already established for Orders in the
 *   Product Module's teaching phase — if an admin changes a price while five
 *   customers have the product in their cart, those carts must not silently
 *   reflect the new price until the cart is explicitly re-validated.
 *
 * INPUT:   Raw JS object passed to `new Cart({...})` or `Cart.create({...})`
 * OUTPUT:  Mongoose Document instance with virtuals attached
 */

import mongoose from "mongoose";

// ─── Cart Item Sub-Schema ─────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },

    priceSnapshot: {
      // Captured from Product's effectivePrice virtual at the moment this
      // item was added. Protects the customer from a mid-cart price change
      // silently altering their total. Re-validated explicitly (never
      // passively) by cart.service.js's getCart and checkout-start flows.
      type: Number,
      required: true,
      min: 0,
    },

    nameSnapshot: {
      // Captured at add-time so the cart UI can render even if the product
      // is later renamed, deactivated, or archived before checkout.
      type: String,
      required: true,
      trim: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// ─── Cart Schema ───────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema(
  {
    userId: {
      // One cart per customer — enforced by the unique index below.
      // This is the join key hit on every "get my cart" request, the
      // single most frequently queried field in this entire module.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    //   unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    status: {
      // active:               normal state, items can be freely modified
      // checkout_in_progress: a reservation hold is active via
      //                       Inventory.reserveStock; cart content changes are
      //                       blocked until the hold resolves (confirm or abandon)
      // completed:            reserved and paid carts may be archived or
      //                       represented as completed in future workflows
      // abandoned:            checkout was cancelled or failed and the cart
      //                       can be transitioned back to active
      type: String,
      enum: {
        values: ["active", "checkout_in_progress", "completed", "abandoned"],
        message: "{VALUE} is not a valid cart status",
      },
      default: "active",
    },

    checkoutRef: {
      // ObjectId of the in-progress Order while status is
      // checkout_in_progress. Null otherwise. Lets the service resolve
      // exactly which reservation to release if checkout is abandoned.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },


     appliedCoupon: {
      // Added by the Coupon module (coupon.service.js's applyCoupon).
      // PROVISIONAL, not yet redeemed — applying a coupon to a cart is a
      // price preview, mirroring Inventory's reserve-now/confirm-later
      // pattern. usedCount on the Coupon document and the CouponRedemption
      // audit record are only written when checkout actually confirms, not
      // when this field is set. Null means no coupon is currently applied.
      // Embedded directly here rather than a separate collection, since it
      // is a single object belonging entirely to this cart's own state —
      // there is nothing here that needs independent querying the way
      // CartItem or CouponRedemption do.
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);



// ─── Virtuals ─────────────────────────────────────────────────────────────────

// itemCount: total distinct line items, used for cart icon badges
cartSchema.virtual("itemCount").get(function () {
  return this.items.length;
});

// totalQuantity: sum of all quantities across all line items
cartSchema.virtual("totalQuantity").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// subtotal: sum of (priceSnapshot * quantity) across all line items —
// uses the SNAPSHOT price, not a live Product lookup, so this number is
// always internally consistent with what the customer saw when they added
// each item. Live re-validation happens separately in the service layer.
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce(
    (sum, item) => sum + item.priceSnapshot * item.quantity,
    0
  );
});

// total: subtotal minus the applied coupon's discount, if any.
// Added by the Coupon module — reads appliedCoupon.discountAmount, which
// was already clamped/capped at apply-time by coupon.service.js, so this
// virtual never needs to know discountType, maxDiscountAmount, or any
// other Coupon-specific concept. Cart stays unaware of Coupon's internal
// rules; it only ever reads the one resolved number.
cartSchema.virtual("total").get(function () {
  const discount = this.appliedCoupon?.discountAmount || 0;
  return Math.max(0, this.subtotal - discount);
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// userId: unique — enforces 1:1 with User, and is the hottest query in
// the module (hit on every logged-in page load that shows a cart icon).
cartSchema.index({ userId: 1 }, { unique: true });

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
