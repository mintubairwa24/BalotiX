/**
 * admin.validation.js
 *
 * WHY IT EXISTS:
 *   The admin module touches many different bounded contexts, so the route
 *   layer needs a small amount of shared validation that does not belong to
 *   any one domain module. These schemas validate cross-cutting admin query
 *   shapes while the underlying domain services continue to enforce the
 *   actual business rules.
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(["customer", "admin"]).optional(),
  accountStatus: z.enum(["active", "inactive", "suspended"]).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const adminReviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  moderationStatus: z
    .enum(["published", "pending", "flagged", "removed"])
    .optional(),
  userId: objectIdSchema.optional(),
  productId: objectIdSchema.optional(),
  sortBy: z.enum(["createdAt", "rating", "helpfulCount"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const adminInventoryReportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const adminCouponUsageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminRefundOrderSchema = z.object({
  reason: z.string().max(500).trim().default(""),
});
