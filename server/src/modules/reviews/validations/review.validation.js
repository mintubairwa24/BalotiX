/**
 * review.validation.js
 *
 * WHO CALLS IT:
 *   review.routes.js — the validate()/validateQuery() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body / req.query before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as every prior module's
 *   validation file. Notably, productId and orderId are NOT accepted here
 *   as body fields on creation — see createReviewSchema's comment for why
 *   that is a deliberate security choice, not an oversight.
 *
 * INPUT:   Raw req.body / req.query from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// ─── Create Review Schema ──────────────────────────────────────────────────────
// Used by POST /reviews
//
// WHY productId IS THE ONLY IDENTIFIER ACCEPTED FROM THE CLIENT:
//   orderId is deliberately NOT something the client supplies here. If a
//   customer could pass an arbitrary orderId, they could attempt to claim
//   "verified purchase" status using an order that belongs to someone
//   else, or one that never actually contained this product. Instead,
//   review.service.js's createReview independently looks up the
//   customer's OWN delivered orders containing this exact productId —
//   the orderId that ends up stored on the Review document is determined
//   entirely server-side, never trusted from the request.
export const createReviewSchema = z.object({
  productId: objectIdSchema,

  rating: z
    .number({ required_error: "Rating is required" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5"),

  title: z
    .string({ required_error: "Review title is required" })
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters")
    .trim(),

  comment: z
    .string({ required_error: "Review comment is required" })
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must not exceed 1000 characters")
    .trim(),
});

// ─── Update Review Schema ──────────────────────────────────────────────────────
// Used by PATCH /reviews/:id
// Only rating/title/comment are editable. productId, userId, and orderId
// are immutable after creation — a review cannot be silently re-pointed
// at a different product or have its purchase-proof swapped out; if any
// of those need to change, the only correct action is deleting the
// review and creating a new one (which re-runs the full verified-purchase
// check from scratch).
export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5")
    .optional(),

  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters")
    .trim()
    .optional(),

  comment: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must not exceed 1000 characters")
    .trim()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field (rating, title, or comment) must be provided" }
);

// ─── Product Reviews Query Schema ────────────────────────────────────────────
// Used by GET /reviews/product/:productId
export const productReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt", "rating", "helpfulCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ─── User Reviews Query Schema ────────────────────────────────────────────────
// Used by GET /reviews/my-reviews
export const userReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ─── Admin Reviews Query Schema ───────────────────────────────────────────────
// Used by GET /admin/reviews
export const adminReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(120).optional(),
  moderationStatus: z.enum(["all", "published", "removed"]).default("all"),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt", "rating"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
