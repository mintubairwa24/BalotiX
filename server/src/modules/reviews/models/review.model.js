/**
 * review.model.js
 *
 * WHO CALLS IT:
 *   review.service.js imports this model for all DB operations. No other
 *   module ever writes to Review — product.service.js reads Product's own
 *   averageRating/totalReviews/ratingBreakdown fields (which THIS module
 *   keeps in sync), but never queries the Review collection directly.
 *
 * WHY IT EXISTS:
 *   Represents one customer's rating and written feedback on a product
 *   they have actually purchased and received. This is the first module
 *   in the codebase whose core trust problem is NOT stock or money — it
 *   is authenticity: "did this person really buy and receive this item,"
 *   answered by checking the Orders module before a Review document is
 *   ever allowed to exist (see review.service.js's verifyPurchase).
 *
 * FOR A JUNIOR DEVELOPER — THE BIG PICTURE:
 *   A Review is created once a Product's Order reaches "delivered" status.
 *   Every time a review is created, updated, or deleted, the Product
 *   document's averageRating/totalReviews/ratingBreakdown fields get
 *   recalculated from scratch using a MongoDB aggregation query (see
 *   review.service.js's recalculateProductRating). This keeps Product
 *   fast to read (no need to scan every Review just to show a star
 *   rating on a listing page) while Review remains the single source of
 *   truth for the underlying data.
 *
 * INPUT:   Raw JS object passed to `Review.create({...})`
 * OUTPUT:  Mongoose Document instance
 */

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      // The customer who wrote this review. Every ownership check in
      // review.service.js (updateReview, deleteReview) compares this
      // field against the authenticated requester's _id — a review can
      // ONLY ever be edited or deleted by the person who wrote it, never
      // by another customer, regardless of role.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      // Which product this review is about. Combined with userId below
      // into a unique compound index — this is what enforces "one user
      // can only create one review per product" at the database level,
      // not merely as an application-level check that could be bypassed
      // by a race condition (two simultaneous create requests).
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    orderId: {
      // WHICH delivered order proves this purchase actually happened.
      // Stored (not just checked-then-discarded) so that:
      //   1. The review can be traced back to a specific transaction for
      //      future moderation/dispute resolution
      //   2. isVerifiedPurchase's truth is auditable — an admin can
      //      always confirm exactly which order justified the
      //      "verified" badge, rather than trusting a boolean alone
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    rating: {
      // A 1-5 star rating. Stored as a plain integer (not a string or
      // float) because this is the exact value MongoDB's aggregation
      // pipeline averages in recalculateProductRating — integer math
      // keeps that calculation simple and matches how
      // Product.ratingBreakdown's keys (1-5) are structured.
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must not exceed 5"],
    },

    title: {
      // A short headline for the review (e.g. "Great build quality").
      // Kept separate from `comment` because product listing UIs often
      // show only the title in a compact review summary, with the full
      // comment expandable — splitting these at the schema level avoids
      // the frontend needing to truncate a single combined field itself.
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [100, "Title must not exceed 100 characters"],
    },

    comment: {
      // The full written review body.
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Comment must not exceed 1000 characters"],
    },

    isVerifiedPurchase: {
      // Always true in the current design — review.service.js's
      // createReview REJECTS the request entirely if verification fails,
      // so no unverified Review document can ever be created. The field
      // is still stored explicitly (rather than just being implied by
      // existence) for two reasons: it is immediately useful to the
      // frontend ("Verified Purchase" badge) without any extra lookup,
      // and it future-proofs the schema for a possible later relaxation
      // of the rule (e.g. allowing unverified reviews with a visible
      // "not verified" label instead of an outright block) without a
      // schema migration.
      type: Boolean,
      default: true,
    },

    helpfulCount: {
      // FUTURE COMPATIBILITY: not yet incremented by any endpoint in
      // this version of the module (no "mark helpful" route exists yet),
      // but included now so a future helpful-votes feature requires only
      // a new service method and route — not a schema migration on a
      // collection that may already contain thousands of documents by
      // the time that feature is built.
      type: Number,
      default: 0,
      min: 0,
    },

    // ── FUTURE COMPATIBILITY: Moderation ──────────────────────────────────────
    // Not used by any logic in this version — every review is implicitly
    // "published" the moment it is created. Included now, defaulted to a
    // value that preserves today's actual behavior, so that introducing
    // an admin moderation queue later only requires adding service
    // methods and a route, not retrofitting this field onto a live
    // collection.
    moderationStatus: {
      type: String,
      enum: ["published", "pending", "flagged", "removed"],
      default: "published",
    },

    // ── FUTURE COMPATIBILITY: Media ───────────────────────────────────────────
    // Empty arrays today — no upload endpoint exists yet in this version.
    // Reserved so review images/videos can be added later without a
    // schema migration; storing as URL strings (consistent with how
    // product.model.js stores image URLs rather than binary data).
    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// userId + productId: UNIQUE COMPOUND INDEX. This is not just a
// performance optimisation — it is the actual mechanism that enforces
// "one user can only create one review per product" at the database
// level. Even if review.service.js's own application-level check had a
// bug or a race condition (two simultaneous createReview calls for the
// same user+product), MongoDB itself would reject the second insert with
// a duplicate-key error, which is a much stronger guarantee than an
// application-only check.
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// productId: THE core query for the public-facing feature this module
// exists to serve — "show me every review for this product" — hit every
// time a product detail page loads its reviews section. At thousands of
// reviews per popular product, this index is what keeps that query fast.
reviewSchema.index({ productId: 1 });

// createdAt: for newest-first sorting, the default ordering on both
// getProductReviews and getUserReviews.
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;