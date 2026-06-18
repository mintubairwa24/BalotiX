/**
 * inventory.validation.js
 *
 * WHO CALLS IT:
 *   inventory.routes.js — the validate()/validateQuery() middleware from
 *   shared/middleware/validate.middleware.js runs these schemas against
 *   req.body / req.query before the request reaches the controller.
 *
 * WHY IT EXISTS:
 *   Same security/data-integrity boundary as product.validation.js and
 *   category.validation.js. Enforces that quantities are positive integers
 *   (a negative restock or a fractional unit makes no physical sense), and
 *   that movement types match the fixed enum on StockMovement.
 *
 * INPUT:   Raw req.body / req.query from the HTTP request
 * OUTPUT:  Parsed, type-coerced, validated object — or a structured error list
 */

import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid MongoDB ObjectId");

// ─── Create Inventory Record Schema ──────────────────────────────────────────
// Used when an Inventory record is first created for a new Product.
// Initial warehouseStock is optional — many admins create the product first,
// then restock it separately via the dedicated restock endpoint.
export const createInventorySchema = z.object({
  productId: objectIdSchema,

  sku: z
    .string({ required_error: "SKU is required" })
    .min(2)
    .max(50)
    .regex(/^[A-Z0-9-]+$/, "SKU must be uppercase letters, numbers, and hyphens")
    .trim(),

  warehouseStock: z
    .number()
    .int("Warehouse stock must be a whole number")
    .min(0, "Warehouse stock cannot be negative")
    .default(0),

  lowStockThreshold: z
    .number()
    .int()
    .min(0)
    .default(5),

  reorderPoint: z
    .number()
    .int()
    .min(0)
    .default(5),
});

// ─── Restock Schema ───────────────────────────────────────────────────────────
// Used by POST /inventory/:productId/restock
// Quantity is always a POSITIVE integer here — restocking can only add stock.
// To correct a count downward, use the adjustment endpoint instead, which
// accepts signed quantities and requires a note explaining why.
export const restockSchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Restock quantity must be greater than 0"),

  note: z.string().max(500).trim().default(""),
});

// ─── Adjustment Schema ────────────────────────────────────────────────────────
// Used by POST /inventory/:productId/adjust
// Quantity can be positive (count came in higher than recorded) or negative
// (count came in lower, e.g. damaged/lost stock). A note is REQUIRED here,
// unlike restock, because adjustments represent a discrepancy that needs an
// auditable explanation — this is the one place admins manually override the
// system's own arithmetic.
export const adjustmentSchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .refine((val) => val !== 0, "Adjustment quantity cannot be zero"),

  note: z
    .string({ required_error: "A note is required for manual adjustments" })
    .min(5, "Note must explain the reason for this adjustment")
    .max(500)
    .trim(),
});

// ─── Reserve Stock Schema ─────────────────────────────────────────────────────
// Used by POST /inventory/:productId/reserve — called by the Cart/Orders
// module when a customer begins checkout. Not directly admin-facing.
export const reserveStockSchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Reservation quantity must be greater than 0"),

  reference: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Reference must be a valid ObjectId")
    .optional(),
});

// ─── Release / Confirm Reservation Schema ────────────────────────────────────
// Used by POST /inventory/:productId/release and /inventory/:productId/confirm
// Same shape — both operations resolve a previously created reservation,
// either returning the stock (release) or making the deduction permanent
// (confirm). Kept as one schema since both need only quantity + reference.
export const resolveReservationSchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),

  reference: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Reference must be a valid ObjectId")
    .optional(),
});

// ─── Update Threshold Schema ──────────────────────────────────────────────────
// Used by PATCH /inventory/:productId/threshold — admin tunes alerting
// sensitivity per-product without touching warehouseStock itself.
export const updateThresholdSchema = z.object({
  lowStockThreshold: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().min(0).optional(),
}).refine(
  (data) => data.lowStockThreshold !== undefined || data.reorderPoint !== undefined,
  { message: "At least one of lowStockThreshold or reorderPoint must be provided" }
);

// ─── Update Status Schema ──────────────────────────────────────────────────────
// Used by PATCH /inventory/:productId/status — primarily for the
// "discontinued" transition, since in_stock/low_stock/out_of_stock are
// otherwise computed automatically by the service after every stock change.
export const updateInventoryStatusSchema = z.object({
  status: z.enum(["in_stock", "low_stock", "out_of_stock", "discontinued"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value",
  }),
});

// ─── Movement History Query Schema ───────────────────────────────────────────
// Validates query params for GET /inventory/:productId/movements
export const movementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z
    .enum(["sale", "restock", "return", "adjustment", "reservation", "release"])
    .optional(),
});

// ─── Inventory List Query Schema ──────────────────────────────────────────────
// Validates query params for GET /inventory — the admin dashboard listing.
export const inventoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["in_stock", "low_stock", "out_of_stock", "discontinued"])
    .optional(),
  sortBy: z
    .enum(["createdAt", "warehouseStock", "updatedAt"])
    .default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});