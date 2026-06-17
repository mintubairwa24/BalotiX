/**
 * product.validation.js
 *
 * WHO CALLS IT:
 *   product.routes.js — the Zod validation middleware runs this schema
 *   against req.body before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Validation is the security and data-integrity boundary of your API.
 *   It catches malformed data, enforces business rules (e.g. salePrice < price),
 *   and prevents NoSQL injection by refusing non-string values on string fields.
 *   By the time the controller runs, req.body is guaranteed to be type-safe.
 *
 * INPUT:   Raw req.body object from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 *
 * ARCHITECTURE NOTE:
 *   We export separate schemas for CREATE and UPDATE.
 *   Update uses .partial() so no field is required — you only send what changes.
 *   But UPDATE still enforces the same business rules on whatever IS sent.
 */

import { z } from "zod";

// ─── Image Schema ─────────────────────────────────────────────────────────────
const imageSchema = z.object({
  url: z
    .string({ required_error: "Image URL is required" })
    .url("Image URL must be a valid URL"),
  altText: z.string().max(200, "Alt text too long").default(""),
  isPrimary: z.boolean().default(false),
});

// ─── Dimensions Schema ────────────────────────────────────────────────────────
const dimensionsSchema = z.object({
  length: z.number().min(0).default(0),
  width: z.number().min(0).default(0),
  height: z.number().min(0).default(0),
});

// ─── Base Product Schema ──────────────────────────────────────────────────────
// Contains all field definitions. Used as the foundation for both
// create and update schemas so rules are defined exactly once.
const baseProductSchema = z.object({
  name: z
    .string({ required_error: "Product name is required" })
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name must not exceed 200 characters")
    .trim(),

  description: z
    .string({ required_error: "Product description is required" })
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must not exceed 5000 characters")
    .trim(),

  sku: z
    .string({ required_error: "SKU is required" })
    .min(2, "SKU must be at least 2 characters")
    .max(50, "SKU must not exceed 50 characters")
    .regex(
      /^[A-Z0-9-]+$/,
      "SKU must contain only uppercase letters, numbers, and hyphens"
    )
    .trim(),

  brand: z.string().max(100, "Brand name too long").trim().default(""),

  price: z
    .number({ required_error: "Price is required" })
    .positive("Price must be greater than 0"),

  salePrice: z
    .number()
    .min(0, "Sale price cannot be negative")
    .nullable()
    .default(null),

  currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),

  images: z
    .array(imageSchema)
    .default([]),

  categoryId: z
    .string({ required_error: "Category is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Category ID must be a valid MongoDB ObjectId"),

  tags: z.array(z.string().trim()).default([]),

  attributes: z.record(z.union([z.string(), z.number()])).default({}),

  weight: z.number().min(0, "Weight cannot be negative").default(0),

  dimensions: dimensionsSchema.default({ length: 0, width: 0, height: 0 }),

  lowStockThreshold: z
    .number()
    .int("Low stock threshold must be a whole number")
    .min(0)
    .default(5),

  trackInventory: z.boolean().default(true),

  allowBackorder: z.boolean().default(false),

  status: z
    .enum(["draft", "active", "inactive", "out_of_stock", "archived"])
    .default("draft"),

  isFeatured: z.boolean().default(false),
});

// ─── Create Product Schema ────────────────────────────────────────────────────
// All required fields must be present. Business rules are enforced via .refine().
export const createProductSchema = baseProductSchema.refine(
  (data) => {
    // Business rule: if a salePrice is provided, it must be less than price
    if (data.salePrice !== null && data.salePrice >= data.price) {
      return false;
    }
    return true;
  },
  {
    message: "Sale price must be less than the regular price",
    path: ["salePrice"],
  }
);

// ─── Update Product Schema ────────────────────────────────────────────────────
// All fields are optional. You only send what you want to change.
// The same business rules still apply to whatever IS sent.
export const updateProductSchema = baseProductSchema
  .partial()
  .refine(
    (data) => {
      if (
        data.salePrice !== undefined &&
        data.salePrice !== null &&
        data.price !== undefined &&
        data.salePrice >= data.price
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Sale price must be less than the regular price",
      path: ["salePrice"],
    }
  );

// ─── Update Status Schema ─────────────────────────────────────────────────────
// Used by PATCH /products/:id/status
// Separated from the main update schema for a cleaner, focused API.
export const updateStatusSchema = z.object({
  status: z.enum(["draft", "active", "inactive", "out_of_stock", "archived"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value",
  }),
});

// ─── Query / Filter Schema ────────────────────────────────────────────────────
// Validates and coerces query parameters for GET /products
// All params come in as strings from the URL — we coerce them to the right types.
export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),

  // Filtering
  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID")
    .optional(),
  status: z
    .enum(["draft", "active", "inactive", "out_of_stock", "archived"])
    .optional(),
  brand: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStock: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  isFeatured: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  tags: z
    .string()
    .transform((val) => val.split(",").map((t) => t.trim()))
    .optional(),

  // Sorting
  sortBy: z
    .enum(["price", "createdAt", "averageRating", "name", "stockQuantity"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),

  // Search (full-text)
  search: z.string().trim().optional(),
}).refine(
  (data) => {
    if (
      data.minPrice !== undefined &&
      data.maxPrice !== undefined &&
      data.minPrice > data.maxPrice
    ) {
      return false;
    }
    return true;
  },
  {
    message: "minPrice cannot be greater than maxPrice",
    path: ["minPrice"],
  }
);