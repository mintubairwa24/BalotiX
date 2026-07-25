/**
 * coupon.validation.js
 *
 * WHO CALLS IT:
 *   coupon.routes.js — the validate() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as every prior module. The one
 *   rule that cannot live as a single-field schema constraint: a
 *   "percentage" discountValue must be capped at 100, but a "fixed"
 *   discountValue has no such ceiling — this is a cross-field rule,
 *   enforced via .refine(), the same technique product.validation.js used
 *   for salePrice < price.
 *
 * INPUT:   Raw req.body / req.query from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// ─── Base Coupon Schema ────────────────────────────────────────────────────────
const baseCouponSchema = z.object({
  code: z
    .string({ required_error: "Coupon code is required" })
    .min(3, "Coupon code must be at least 3 characters")
    .max(30, "Coupon code must not exceed 30 characters")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Coupon code must contain only letters, numbers, hyphens, and underscores"
    )
    .trim(),

  description: z.string().max(300).trim().default(""),

  discountType: z.enum(["percentage", "fixed"], {
    required_error: "Discount type is required",
  }),

  discountValue: z
    .number({ required_error: "Discount value is required" })
    .positive("Discount value must be greater than 0"),

  maxDiscountAmount: z.number().min(0).nullable().default(null),

  minOrderValue: z.number().min(0).default(0),

  usageLimit: z
    .number()
    .int("Usage limit must be a whole number")
    .positive("Usage limit must be greater than 0")
    .nullable()
    .default(null),

  usagePerUser: z
    .number()
    .int("Usage per user must be a whole number")
    .positive("Usage per user must be greater than 0")
    .default(1),

  validFrom: z.coerce.date({ required_error: "Valid-from date is required" }),

  validUntil: z.coerce.date({ required_error: "Valid-until date is required" }),

  isActive: z.boolean().default(true),
});

// ─── Cross-Field Refinements (shared by create and update) ──────────────────
/**
 * Not exported. Applied identically to both createCouponSchema and
 * updateCouponSchema via .superRefine() composition below, so the two
 * business rules are defined exactly once rather than duplicated.
 */
const applyCouponRefinements = (schema) =>
  schema
    .refine(
      (data) => {
        // A percentage discount can never exceed 100% — a rule that only
        // makes sense in the context of discountType, hence cross-field.
        if (data.discountType === "percentage" && data.discountValue > 100) {
          return false;
        }
        return true;
      },
      {
        message: "Percentage discount value cannot exceed 100",
        path: ["discountValue"],
      }
    )
    .refine(
      (data) => {
        if (data.validFrom && data.validUntil) {
          return data.validUntil > data.validFrom;
        }
        return true;
      },
      {
        message: "validUntil must be after validFrom",
        path: ["validUntil"],
      }
    );

// ─── Create Coupon Schema ──────────────────────────────────────────────────────
export const createCouponSchema = applyCouponRefinements(baseCouponSchema);

// ─── Update Coupon Schema ──────────────────────────────────────────────────────
// All fields optional — only send what changes. The cross-field refinements
// still apply to whatever combination of fields IS present in the update.
export const updateCouponSchema = applyCouponRefinements(
  baseCouponSchema.partial()
);

// ─── Validate / Apply Coupon Schema ──────────────────────────────────────────
// Used by POST /coupons/validate and POST /coupons/apply — the
// customer-facing "enter promo code" action. No date/limit fields here;
// those are read from the stored Coupon document, not supplied by the caller.
export const applyCouponSchema = z.object({
  code: z
    .string({ required_error: "Coupon code is required" })
    .min(1, "Coupon code is required")
    .trim(),
});

// ─── List Coupons Query Schema ────────────────────────────────────────────────
// Validates query params for GET /coupons (admin dashboard listing).
export const couponQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  status: z.enum(["active", "inactive", "expired"]).optional(),
  sortBy: z
    .enum([
      "createdAt",
      "code",
      "discountValue",
      "validUntil",
      "usedCount",
      "isActive",
      "expiryDate",
      "usageCount",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateCouponStatusSchema = z.object({
  isActive: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
