/**
 * coupon.model.js
 *
 * WHO CALLS IT:
 *   coupon.service.js imports this model for all DB operations. No other
 *   module ever writes to Coupon directly — Cart only reads validation
 *   results through coupon.service.js's exported functions, never touching
 *   this model itself.
 *
 * WHY IT EXISTS:
 *   Defines a discount rule that can be applied to a Cart's subtotal.
 *   Deliberately minimal — two discount types (percentage, fixed), not a
 *   generic rule engine, matching the same "don't build more than the
 *   business needs" discipline used throughout every prior module.
 *
 * WHY usedCount IS A COUNTER BUT usagePerUser NEEDS A SEPARATE COLLECTION:
 *   usedCount answers "how many times total has this code been redeemed" —
 *   a single running number, safe to increment atomically. usagePerUser
 *   answers "how many times has THIS customer redeemed it" — that requires
 *   per-user history, which a single counter cannot express. See
 *   couponRedemption.model.js for the append-only log that answers it,
 *   the same two-tier pattern already used by Inventory/StockMovement.
 *
 * INPUT:   Raw JS object passed to `new Coupon({...})` or `Coupon.create({...})`
 * OUTPUT:  Mongoose Document instance with virtuals attached
 */

import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      // What the customer types at checkout. Uppercased and trimmed so
      // "save20", "SAVE20", and " SAVE20 " all resolve to the same coupon —
      // the unique index below operates on this normalised form.
      type: String,
      required: [true, "Coupon code is required"],    
      // unique: true, // This is defined below in the indexes section for clarity
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [30, "Coupon code must not exceed 30 characters"],
    },

    description: {
      // Admin-facing only — explains the campaign this coupon belongs to.
      // Never shown to customers, who only ever see the code itself.
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    // ── Discount Definition ──────────────────────────────────────────────────
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "fixed"],
        message: "{VALUE} is not a valid discount type",
      },
      required: true,
    },

    discountValue: {
      // For "percentage": 20 means 20% off. For "fixed": 200 means ₹200 off.
      // Upper bound for percentage (<=100) is enforced in coupon.validation.js,
      // not here, since the valid range depends on discountType — a rule that
      // spans two fields belongs in Zod's .refine(), not a single-field schema
      // constraint.
      type: Number,
      required: true,
      min: [0, "Discount value cannot be negative"],
    },

    maxDiscountAmount: {
      // Caps a PERCENTAGE discount in absolute terms. Without this, a 20%
      // coupon on an unexpectedly large cart could discount far more than
      // an admin intended. Ignored entirely for "fixed" discounts, since a
      // fixed value can never exceed what was explicitly configured.
      // Null means uncapped.
      type: Number,
      default: null,
      min: 0,
    },

    minOrderValue: {
      // Cart subtotal must reach this before the coupon is even offered.
      // Read against Cart's live `subtotal` virtual at validation time —
      // never a stored snapshot.
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Usage Limits ──────────────────────────────────────────────────────────
    usageLimit: {
      // Total redemptions allowed across ALL customers. Null = unlimited.
      // Answers "how many times has this campaign run" — a flash promo
      // capped at the first 500 redemptions, for example.
      type: Number,
      default: null,
      min: 1,
    },

    usagePerUser: {
      // Max redemptions allowed for a SINGLE customer. Almost always 1 for
      // "first order" style coupons — otherwise one customer could apply
      // the same discount to every order they ever place.
      type: Number,
      default: 1,
      min: 1,
    },

    usedCount: {
      // Running total across all users. Incremented atomically on every
      // confirmed redemption — never read-then-written, same atomicity
      // discipline established in inventory.service.js.
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Validity Window ───────────────────────────────────────────────────────
    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    isActive: {
      // Admin kill-switch, independent of the date window. An admin can
      // disable a coupon early (e.g. a pricing mistake) without needing to
      // edit validUntil, which would otherwise also affect reporting on
      // the originally intended campaign length.
      type: Boolean,
      default: true,
    },

    // ── Audit Trail ───────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
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

// ─── Virtuals ─────────────────────────────────────────────────────────────────
// Status is NEVER stored — it is always derived from real values at read
// time. This avoids the entire class of bugs where a stored status field
// drifts out of sync with the actual date (a cron job that didn't run, a
// clock skew). Same discipline as Inventory's computeStatus() pattern.

couponSchema.virtual("isExpired").get(function () {
  return new Date() > this.validUntil;
});

couponSchema.virtual("isNotYetValid").get(function () {
  return new Date() < this.validFrom;
});

couponSchema.virtual("isExhausted").get(function () {
  return this.usageLimit !== null && this.usedCount >= this.usageLimit;
});

// isRedeemable: the single source of truth combining every condition that
// does NOT depend on a specific user (date window, kill-switch, total
// usage cap). Per-user usage is checked separately in the service layer
// against CouponRedemption, since a virtual cannot query another collection.
couponSchema.virtual("isRedeemable").get(function () {
  return (
    this.isActive &&
    !this.isExpired &&
    !this.isNotYetValid &&
    !this.isExhausted
  );
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// code: unique — the single most-hit query in this module, fired on every
// "apply promo code" attempt at checkout.
couponSchema.index({ code: 1 }, { unique: true });

// isActive + validUntil: powers admin dashboard views like "active campaigns
// expiring soon" without a full collection scan.
couponSchema.index({ isActive: 1, validUntil: 1 });

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
