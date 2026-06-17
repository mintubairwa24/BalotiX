/**
 * category.validation.js
 *
 * WHO CALLS IT:
 *   category.routes.js — the validate()/validateQuery() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body / req.query before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security and data-integrity boundary as product.validation.js.
 *   Catches malformed data and enforces business rules (valid ObjectId for
 *   parentId, valid enum for status) before any DB write is attempted.
 *
 * INPUT:   Raw req.body / req.query from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

// Reusable ObjectId pattern — identical regex used in product.validation.js
// for categoryId, kept consistent across modules.
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// ─── Base Category Schema ──────────────────────────────────────────────────
const baseCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must not exceed 100 characters")
    .trim(),

  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .default(""),

  image: z
    .string()
    .url("Image must be a valid URL")
    .or(z.literal(""))
    .default(""),

  // Optional because root categories have no parent.
  // nullable() allows explicit { parentId: null } to mark a category as root.
  parentId: objectIdSchema.nullable().optional(),

  displayOrder: z
    .number()
    .int("Display order must be a whole number")
    .default(0),

  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

// ─── Create Category Schema ──────────────────────────────────────────────────
// All required fields must be present.
export const createCategorySchema = baseCategorySchema;

// ─── Update Category Schema ──────────────────────────────────────────────────
// All fields optional — only send what changes.
// Re-parenting (changing parentId) is allowed here; the service layer
// handles cascading ancestors/level updates to descendants.
export const updateCategorySchema = baseCategorySchema.partial();

// ─── Update Status Schema ──────────────────────────────────────────────────────
// Used by PATCH /categories/:id/status — mirrors product's focused status endpoint.
export const updateCategoryStatusSchema = z.object({
  status: z.enum(["active", "inactive", "archived"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value",
  }),
});

// ─── Query / Filter Schema ────────────────────────────────────────────────────
// Validates query parameters for GET /categories
export const categoryQuerySchema = z.object({
  // flat=true returns a plain array (frontend builds its own tree).
  // flat=false (default) returns a server-assembled nested tree structure.
  flat: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .default("false"),

  status: z.enum(["active", "inactive", "archived"]).optional(),

  parentId: objectIdSchema.nullable().optional(),

  // When provided, returns this category and ALL its descendants
  // (uses the ancestors index — see category.model.js)
  ancestorOf: objectIdSchema.optional(),
});