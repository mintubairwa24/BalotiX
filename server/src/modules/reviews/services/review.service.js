/**
 * review.service.js
 *
 * WHO CALLS IT:
 *   review.controller.js for all HTTP-driven operations. No future module
 *   is expected to call into Review the way Review calls into Order and
 *   Product — Review is a terminal consumer in the dependency graph,
 *   mirroring Wishlist's position relative to Cart.
 *
 * WHY IT EXISTS:
 *   Owns the one rule no other module enforces: a review may only exist
 *   if it represents a genuine, completed purchase. This file is the
 *   ONLY place permitted to write to the Review collection, and the ONLY
 *   place permitted to write Product.averageRating/totalReviews/
 *   ratingBreakdown — centralising both is what keeps "a product's
 *   displayed rating always reflects its actual reviews" an enforceable
 *   guarantee rather than just a convention.
 *
 * FOR A JUNIOR DEVELOPER — READ THIS BEFORE THE FUNCTIONS BELOW:
 *   Two ideas repeat throughout this file and are worth understanding
 *   up front:
 *
 *   1. VERIFIED PURCHASE CHECK (verifyPurchase, used only by createReview):
 *      Before any review can be created, this service queries the Orders
 *      module's OWN models directly (Order + OrderItem) to confirm three
 *      things are simultaneously true: the order belongs to this exact
 *      user, the order actually contains this exact product, and the
 *      order's status is "delivered". All three must hold, or the
 *      request is rejected outright — there is no partial-credit path.
 *
 *   2. RATING RECALCULATION (recalculateProductRating, called after every
 *      create/update/delete): rather than incrementing or decrementing a
 *      running average by hand (which is error-prone — what happens to
 *      the average when a 5-star review becomes a 2-star edit, or gets
 *      deleted entirely?), this function re-derives Product's
 *      averageRating/totalReviews/ratingBreakdown FROM SCRATCH using a
 *      MongoDB aggregation pipeline every single time. This is simpler
 *      to reason about and immune to a whole category of "the running
 *      total drifted out of sync" bugs, at the cost of one aggregation
 *      query per review write — a cost worth paying for correctness,
 *      and one MongoDB's indexes (see review.model.js) keep cheap even
 *      at thousands of reviews per product.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects (Review documents) or thrown errors
 */

import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Product from "../../products/models/product.model.js";
import Order from "../../orders/models/order.model.js";
import OrderItem from "../../orders/models/orderItem.model.js";

// ─── Internal Helper: Verify Purchase ────────────────────────────────────────
/**
 * Before creating review: check Orders Module.
 *
 * WHY THIS CHECK EXISTS:
 *   Without it, any logged-in customer could review any product, whether
 *   they ever bought it or not — undermining the entire point of a
 *   "verified purchase" review system, which exists to give other
 *   shoppers confidence that reviews reflect real product experience.
 *
 * HOW IT WORKS:
 *   This queries Order and OrderItem DIRECTLY (not through
 *   orderService's exported functions) because the question being asked
 *   here — "find me a delivered order, owned by this user, that contains
 *   this product" — is a read-only existence check that doesn't fit any
 *   of Order's existing service methods (which are shaped around
 *   "fetch one order by ID" or "list my orders", not "does a qualifying
 *   order exist for this user+product pair"). Reading the models
 *   directly here is the same pattern coupon.service.js used when
 *   reading Cart.subtotal directly rather than going through
 *   cartService — a read-only cross-module query that doesn't warrant a
 *   new exported service function on the other side.
 *
 * @param {string} userId    - MongoDB ObjectId of the customer
 * @param {string} productId - MongoDB ObjectId of the product being reviewed
 * @returns {string}         - The orderId that satisfies all three
 *                              conditions, to be stored on the Review
 * @throws                   - If no qualifying order exists
 */
const verifyPurchase = async (userId, productId) => {
  // Find every order belonging to this user that has reached "delivered"
  // status — this is condition 1 (belongs to user) and condition 3
  // (status delivered) combined into a single query.
  const deliveredOrders = await Order.find(
    { userId, status: "delivered" },
    "_id"
  ).lean();

  if (deliveredOrders.length === 0) {
    const error = new Error(
      "You can only review products from orders that have been delivered"
    );
    error.statusCode = 403;
    throw error;
  }

  const deliveredOrderIds = deliveredOrders.map((order) => order._id);

  // Condition 2 (order contains this product): search OrderItem for a
  // line item matching this exact product, restricted to the set of
  // delivered orders found above. $in against an indexed orderId field
  // keeps this fast even if the customer has many historical orders.
  const matchingOrderItem = await OrderItem.findOne({
    orderId: { $in: deliveredOrderIds },
    productId,
  }).lean();

  if (!matchingOrderItem) {
    const error = new Error(
      "You can only review products you have purchased and received"
    );
    error.statusCode = 403;
    throw error;
  }

  // All three conditions satisfied — return the specific order that
  // proves it, to be stored on the Review document for future audit
  // traceability (see review.model.js's orderId field comment).
  return matchingOrderItem.orderId;
};

// ─── Internal Helper: Recalculate Product Rating ─────────────────────────────
/**
 * Use aggregation for calculations.
 *
 * Re-derives Product.averageRating, Product.totalReviews, and
 * Product.ratingBreakdown ENTIRELY FROM the current state of the Review
 * collection — never incrementally adjusted. See the file-header comment
 * for why "recompute from scratch" is the deliberate design here rather
 * than maintaining a running total.
 *
 * THE AGGREGATION PIPELINE EXPLAINED FOR A JUNIOR DEVELOPER:
 *   $match   - narrows to only this product's reviews, using the
 *              indexed productId field (see review.model.js's index)
 *   $group   - collapses all matching documents into ONE result,
 *              computing $avg (the new average) and $sum (the new
 *              total count) in the same pass over the data
 *   $push    - separately, $group also collects every individual rating
 *              value into an array, which is then reduced in plain JS
 *              below into the per-star counts Product.ratingBreakdown
 *              needs (how many 5-star reviews, how many 4-star, etc.)
 *
 *   This is a single round trip to MongoDB regardless of how many
 *   reviews the product has — at thousands of reviews, this remains one
 *   query, not thousands of individual document reads.
 *
 * WHY THIS IS CALLED AFTER EVERY CREATE/UPDATE/DELETE:
 *   A review's rating can change (update) or disappear (delete) just as
 *   easily as a new one can appear (create) — Product's displayed rating
 *   must reflect ALL THREE of those events, not just creation. Calling
 *   this one shared function from all three operations guarantees that
 *   consistency without three separate, possibly-diverging calculations.
 *
 * @param {string} productId - MongoDB ObjectId of the product to recalculate
 */
const recalculateProductRating = async (productId) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);

  const result = await Review.aggregate([
    // Hidden reviews should not count toward the public rating. The admin
    // moderation workflow toggles moderationStatus, and the storefront
    // rating must reflect only published feedback.
    {
      $match: {
        productId: productObjectId,
        moderationStatus: "published",
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        ratings: { $push: "$rating" },
      },
    },
  ]);

  if (result.length === 0) {
    // No reviews remain for this product (e.g. the last review was just
    // deleted) — reset to the same defaults Product.model.js's schema
    // itself defaults to, so a product with zero reviews always shows a
    // clean 0/0 state rather than stale data from before its last review
    // was removed.
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      totalReviews: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
    return;
  }

  const { averageRating, totalReviews, ratings } = result[0];

  // Reduce the flat ratings array into per-star counts. Plain JS here
  // (not a second aggregation stage) since this is a small, in-memory
  // array (one entry per review already fetched in the pipeline above)
  // and a $bucket aggregation stage would be more complex for the same
  // result at this scale.
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => {
    ratingBreakdown[r] += 1;
  });

  // Round to one decimal place — a raw $avg like 4.3333... is not how
  // star ratings are conventionally displayed (4.3 reads cleanly,
  // 4.3333333333333 does not), and rounding here once keeps every
  // consumer of Product.averageRating (listing pages, detail pages)
  // automatically consistent without each having to round independently.
  const roundedAverage = Math.round(averageRating * 10) / 10;

  await Product.findByIdAndUpdate(productId, {
    averageRating: roundedAverage,
    totalReviews,
    ratingBreakdown,
  });
};

const assertValidReviewId = (reviewId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    const error = new Error("Invalid review ID format");
    error.statusCode = 400;
    throw error;
  }
};

// ─── Create Review ────────────────────────────────────────────────────────────
/**
 * A customer can review a product only if:
 *   1. User is authenticated        -> enforced by requireAuth at the route
 *   2. User has purchased the product
 *   3. Related order status is DELIVERED
 *   4. User has not already reviewed the product
 *
 * Conditions 2 and 3 are checked together by verifyPurchase above.
 * Condition 4 is checked explicitly here AND backstopped by the unique
 * compound index on { userId, productId } in review.model.js — the
 * explicit check gives a clean, descriptive error message; the index is
 * the unbreakable guarantee underneath it in case of a race condition
 * (two simultaneous create requests for the same user+product).
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated customer
 * @param {Object} data   - { productId, rating, title, comment }, already
 *                           validated by Zod
 * @returns {Object}      - The newly created review document
 */
export const createReview = async (userId, data) => {
  const { productId, rating, title, comment } = data;

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  // Condition 4: explicit pre-check for a clear, specific error message.
  const existingReview = await Review.findOne({ userId, productId });
  if (existingReview) {
    const error = new Error("You have already reviewed this product");
    error.statusCode = 409;
    throw error;
  }

  // Conditions 2 and 3: only a genuinely delivered purchase reaches here.
  const orderId = await verifyPurchase(userId, productId);

  const review = await Review.create({
    userId,
    productId,
    orderId,
    rating,
    title,
    comment,
    isVerifiedPurchase: true, // always true — see review.model.js's field comment
  });

  // Product's displayed rating must reflect this new review immediately.
  await recalculateProductRating(productId);

  return review.toJSON();
};

// ─── Update Review ────────────────────────────────────────────────────────────
/**
 * OWNERSHIP CHECK:
 *   A review can only be edited by the user who wrote it. This is
 *   checked here, in the service layer, rather than relying solely on a
 *   route-level role check — there is no "admin can edit any review"
 *   provision in this version (only ownership), matching the brief's
 *   "User cannot modify another user's review" rule exactly. A future
 *   admin-moderation feature (see moderationStatus on the schema) would
 *   add a SEPARATE admin-only endpoint/service method rather than
 *   loosening this check.
 *
 * Only rating, title, and comment are editable — see
 * updateReviewSchema's comment for why productId/userId/orderId are
 * immutable.
 *
 * @param {string} reviewId - MongoDB ObjectId of the Review
 * @param {string} userId   - The authenticated requester's _id
 * @param {Object} updates  - Partial { rating?, title?, comment? }
 * @returns {Object}        - Updated review document
 */
export const updateReview = async (reviewId, userId, updates) => {
  assertValidReviewId(reviewId);

  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (review.moderationStatus !== "published") {
    const error = new Error("This review is no longer editable");
    error.statusCode = 403;
    throw error;
  }

  if (review.userId.toString() !== userId.toString()) {
    const error = new Error("You do not have permission to edit this review");
    error.statusCode = 403;
    throw error;
  }

  Object.assign(review, updates);
  await review.save();

  // A rating change (e.g. 5 stars edited down to 2) must immediately be
  // reflected in Product's average — recalculation runs even if only
  // title/comment changed, since this function doesn't know in advance
  // whether `updates` included a rating change, and recalculating
  // unconditionally is simpler and still cheap (one aggregation query)
  // compared to conditionally skipping it.
  await recalculateProductRating(review.productId);

  return review.toJSON();
};

// ─── Delete Review ────────────────────────────────────────────────────────────
/**
 * OWNERSHIP CHECK: identical rule to updateReview — only the review's
 * own author can delete it.
 *
 * @param {string} reviewId - MongoDB ObjectId of the Review
 * @param {string} userId   - The authenticated requester's _id
 * @returns {Object}        - { _id, message }
 */
export const deleteReview = async (reviewId, userId) => {
  assertValidReviewId(reviewId);

  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (review.moderationStatus !== "published") {
    const error = new Error("This review is no longer deletable");
    error.statusCode = 403;
    throw error;
  }

  if (review.userId.toString() !== userId.toString()) {
    const error = new Error(
      "You do not have permission to delete this review"
    );
    error.statusCode = 403;
    throw error;
  }

  const productId = review.productId;

  await Review.findByIdAndDelete(reviewId);

  // The product's average/total/breakdown must drop this review's
  // contribution immediately — recalculation handles both "one fewer
  // review" and "the average shifts" in the same single pass.
  await recalculateProductRating(productId);

  return { _id: reviewId, message: "Review deleted successfully" };
};

// ─── Get Review By ID ─────────────────────────────────────────────────────────
/**
 * Public-readable — unlike Cart/Wishlist/Payment, a single review's
 * existence is not sensitive; any authenticated user can view any
 * review by ID (still gated by requireAuth at the route, per "all routes
 * require authentication," but with no ownership restriction on reads).
 *
 * @param {string} reviewId - MongoDB ObjectId of the Review
 * @returns {Object}        - Review document
 */
export const getReviewById = async (reviewId) => {
  assertValidReviewId(reviewId);

  const review = await Review.findOne({
    _id: reviewId,
    moderationStatus: "published",
  })
    .populate("userId", "name")
    .lean();

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  return review;
};

/**
 * Admin-only read path for review details.
 *
 * The customer-facing read above intentionally hides moderated content.
 * Admin moderation, however, needs to inspect the review even after it has
 * been hidden or flagged, so this helper returns the document without the
 * moderationStatus filter.
 *
 * @param {string} reviewId - MongoDB ObjectId of the Review
 * @returns {Object}        - Review document
 */
export const getReviewByIdAdmin = async (reviewId) => {
  assertValidReviewId(reviewId);

  const review = await Review.findById(reviewId)
    .populate("userId", "name email")
    .populate("productId", "name slug thumbnail")
    .lean();

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  return review;
};

// ─── Get Product Reviews ──────────────────────────────────────────────────────
/**
 * Paginated list of every review for a given product — the core
 * customer-facing read this module exists to serve (a product detail
 * page's reviews section). Supports filtering by a specific star rating
 * and sorting, both common UI affordances on review listings.
 *
 * @param {string} productId - MongoDB ObjectId of the Product
 * @param {Object} query     - Validated query params from productReviewsQuerySchema
 * @returns {Object}         - { reviews, pagination }
 */
export const getProductReviews = async (productId, query) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error("Invalid product ID format");
    error.statusCode = 400;
    throw error;
  }

  const { page, limit, rating, sortBy, sortOrder } = query;

  const filter = { productId, moderationStatus: "published" };
  if (rating) filter.rating = rating;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find(filter)
      .populate("userId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Get User Reviews ─────────────────────────────────────────────────────────
/**
 * Customer-scoped review history ("my reviews"), paginated. Filter always
 * anchored to the authenticated caller's own userId — same ownership
 * discipline as every prior module's "my X" listing (Cart, Wishlist,
 * Orders, Payments).
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated customer
 * @param {Object} query  - Validated query params from userReviewsQuerySchema
 * @returns {Object}      - { reviews, pagination }
 */
export const getUserReviews = async (userId, query) => {
  const { page, limit, sortBy, sortOrder } = query;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find({ userId, moderationStatus: "published" })
      .populate("productId", "name slug thumbnail")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ userId, moderationStatus: "published" }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ---------------------------------------------------------------------------
// Admin moderation helpers
// ---------------------------------------------------------------------------
//
// These helpers keep review moderation in the same service boundary that
// already owns review creation and deletion. The admin module should
// orchestrate these actions, not reimplement how a review is hidden or how
// product ratings are recomputed afterward.
// ---------------------------------------------------------------------------

export const getAllReviews = async (query) => {
  const {
    page,
    limit,
    moderationStatus,
    userId,
    productId,
    sortBy,
    sortOrder,
  } = query;

  const filter = {};

  if (moderationStatus) filter.moderationStatus = moderationStatus;
  if (userId) filter.userId = userId;
  if (productId) filter.productId = productId;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [reviews, totalCount] = await Promise.all([
    Review.find(filter)
      .populate("userId", "name email")
      .populate("productId", "name slug thumbnail")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    reviews,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const hideReview = async (reviewId) => {
  assertValidReviewId(reviewId);

  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (review.moderationStatus === "removed") {
    return review.toJSON();
  }

  review.moderationStatus = "removed";
  await review.save();
  await recalculateProductRating(review.productId);

  return review.toJSON();
};

export const restoreReview = async (reviewId) => {
  assertValidReviewId(reviewId);

  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  if (review.moderationStatus === "published") {
    return review.toJSON();
  }

  review.moderationStatus = "published";
  await review.save();
  await recalculateProductRating(review.productId);

  return review.toJSON();
};

export const deleteReviewByAdmin = async (reviewId) => {
  assertValidReviewId(reviewId);

  const review = await Review.findById(reviewId);

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  const productId = review.productId;
  await Review.findByIdAndDelete(reviewId);
  await recalculateProductRating(productId);

  return { _id: reviewId, message: "Review deleted successfully" };
};
