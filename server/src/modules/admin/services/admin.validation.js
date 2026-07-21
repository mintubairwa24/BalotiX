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