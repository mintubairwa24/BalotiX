/**
 * admin.validation.js
 *
 * Schemas for validating requests to the admin-only user management API.
 */

import { z } from "zod";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["", "active", "suspended"]).optional(),
  role: z.enum(["", "customer", "admin"]).optional(),
  verified: z.enum(["", "verified", "unverified"]).optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"], {
    required_error: "Status is required",
  }),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["customer", "admin"], {
    required_error: "Role is required",
  }),
});

export const updateUserByAdminSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  // Assuming phone is a string. More specific validation could be added.
  phone: z.string().optional(),
});

// Schemas for Product Management
export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["", "active", "draft", "archived"]).optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(["createdAt", "name", "price", "stockQuantity"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const productSchemaBase = z.object({
  name: z.string({ required_error: "Product name is required" }).min(1, "Product name is required"),
  description: z.string({ required_error: "Description is required" }).min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  categoryId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
  stockQuantity: z.coerce.number().int().min(0, "Stock must be non-negative"),
  status: z.enum(["draft", "active", "inactive", "archived"]).optional(),
  sku: z
    .string({ required_error: "SKU is required" })
    .min(1, "SKU is required")
    .regex(/^[A-Z0-9-]+$/, "SKU must contain only uppercase letters, numbers, and hyphens"),
  brand: z.string().optional(),
  images: z.array(z.string().url()).optional(),
});

export const createProductByAdminSchema = productSchemaBase;

export const updateProductByAdminSchema = productSchemaBase.partial();

export const adminUpdateProductStatusSchema = z.object({
  status: z.enum(["active", "archived"], {
    required_error: "Status is required",
  }),
});
