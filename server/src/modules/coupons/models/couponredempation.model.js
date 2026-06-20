/**
 * couponRedemption.model.js
 *
 * WHO CALLS IT:
 *   coupon.service.js writes one record here at the moment a redemption is
 *   CONFIRMED (not when a coupon is merely applied to a cart — see the
 *   apply-vs-redeem distinction in coupon.service.js's doc comments).
 *   Nothing reads this on the hot path; it exists purely to answer the
 *   per-user usage question Coupon's own usedCount counter cannot.
 *
 * WHY IT EXISTS:
 *   Coupon.usedCount tells you the total redemption count. It cannot tell
 *   you whether a SPECIFIC customer has already used this coupon before —
 *   that requires per-user history. This is the exact same two-tier
 *   pattern already established by Inventory/StockMovement: a fast counter
 *   on the parent document, an append-only collection for the queries that
 *   need per-entity history. Embedding this as an array on Coupon would
 *   reintroduce the unbounded-document-growth problem that pattern exists
 *   to avoid — a popular coupon could accumulate thousands of redemptions.
 *
 * INPUT:   Raw JS object passed to `CouponRedemption.create({...})`
 * OUTPUT:  Mongoose Document instance — records are never updated or
 *          deleted after creation, only ever inserted
 */

import mongoose from "mongoose";

const couponRedemptionSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderRef: {
      // The Order this redemption applied to. Typed as Mixed rather than a
      // hard `ref: "Order"` because the Order module does not exist yet —
      // this is the one schema decision explicitly deferred pending the
      // future Orders module. Once Order exists, this can be tightened to
      // a real ref without breaking any already-written records, since
      // ObjectId values are stored identically either way.
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    discountApplied: {
      // The actual rupee amount this specific redemption saved — already
      // resolved through discountType/maxDiscountAmount/subtotal-clamping
      // at the moment of redemption, so reporting never needs to
      // recompute historical discounts from a coupon's CURRENT (possibly
      // since-changed) configuration.
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// couponId + userId: THE core query this collection exists to serve —
// "has this user already redeemed this coupon, and how many times" —
// the check that powers usagePerUser enforcement. Compound so it stays
// fast regardless of how many total redemptions a popular coupon
// accumulates across all customers.
couponRedemptionSchema.index({ couponId: 1, userId: 1 });

// userId: for a future "my redeemed coupons" customer-facing history view.
couponRedemptionSchema.index({ userId: 1, createdAt: -1 });

const CouponRedemption = mongoose.model(
  "CouponRedemption",
  couponRedemptionSchema
);

export default CouponRedemption;