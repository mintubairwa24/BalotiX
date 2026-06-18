/**
 * inventory.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/inventory".
 *   Example: app.use("/api/inventory", inventoryRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Inventory Module. Unlike Product and
 *   Category, EVERY route here requires authentication — there is no public
 *   read surface. Customers never query Inventory directly; they see stock
 *   availability exclusively through Product's stockQuantity/isInStock,
 *   which Inventory keeps synced. This is a deliberate boundary: exposing
 *   warehouseStock/reservedStock publicly would leak operational data
 *   (e.g. exact reserved counts during a flash sale) with no storefront benefit.
 *
 * REUSE NOTE:
 *   Reuses requireAuth, requireRole, validate/validateQuery, and the rate
 *   limiters from shared/middleware/ — identical infrastructure to Product
 *   and Category, proving the shared layer holds up across a third module
 *   with a meaningfully different access pattern (no public routes at all).
 *
 * ROUTE ORDER:
 *   All routes here use the literal "/:productId" prefix consistently rather
 *   than mixing "/:id" patterns, so there is no ambiguity between this
 *   module's routes — every sub-route is suffixed (e.g. "/:productId/restock"),
 *   and Express matches longest/most-specific paths correctly regardless of
 *   declaration order for this particular pattern. Still declared in a
 *   logical read-then-write order for readability.
 */

import express from "express";
import * as inventoryController from "../controllers/inventory.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  createInventorySchema,
  restockSchema,
  adjustmentSchema,
  reserveStockSchema,
  resolveReservationSchema,
  updateThresholdSchema,
  updateInventoryStatusSchema,
  movementQuerySchema,
  inventoryQuerySchema,
} from "../validations/inventory.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// EVERY ROUTE BELOW REQUIRES AUTH — no public surface in this module.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/inventory
 * Admin dashboard listing — paginated, filterable by status.
 */
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  validateQuery(inventoryQuerySchema),
  inventoryController.getAllInventory
);

/**
 * POST /api/inventory
 * Create the inventory record for a product.
 */
router.post(
  "/",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(createInventorySchema),
  inventoryController.createInventory
);

/**
 * GET /api/inventory/:productId
 * Fetch the inventory record for a single product.
 */
router.get(
  "/:productId",
  requireAuth,
  requireRole("admin"),
  inventoryController.getInventoryByProductId
);

/**
 * GET /api/inventory/:productId/movements
 * Paginated, newest-first stock movement audit trail.
 */
router.get(
  "/:productId/movements",
  requireAuth,
  requireRole("admin"),
  validateQuery(movementQuerySchema),
  inventoryController.getMovementHistory
);

/**
 * POST /api/inventory/:productId/restock
 * Admin adds new physical stock. Quantity always positive.
 */
router.post(
  "/:productId/restock",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(restockSchema),
  inventoryController.restock
);

/**
 * POST /api/inventory/:productId/adjust
 * Manual stock correction. Quantity signed; note required.
 */
router.post(
  "/:productId/adjust",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(adjustmentSchema),
  inventoryController.adjustStock
);

/**
 * POST /api/inventory/:productId/reserve
 * Holds stock for an in-progress checkout. Called by Cart/Orders flow.
 * Requires auth (any logged-in customer triggers this indirectly), not
 * restricted to admin — see requireRole below is intentionally omitted here.
 */
router.post(
  "/:productId/reserve",
  productRateLimiter,
  requireAuth,
  validate(reserveStockSchema),
  inventoryController.reserveStock
);

/**
 * POST /api/inventory/:productId/confirm
 * Converts a reservation into a permanent sale. Called when payment succeeds.
 */
router.post(
  "/:productId/confirm",
  productRateLimiter,
  requireAuth,
  validate(resolveReservationSchema),
  inventoryController.confirmReservation
);

/**
 * POST /api/inventory/:productId/release
 * Releases a reservation back to available stock. Called on payment failure.
 */
router.post(
  "/:productId/release",
  productRateLimiter,
  requireAuth,
  validate(resolveReservationSchema),
  inventoryController.releaseReservation
);

/**
 * POST /api/inventory/:productId/return
 * Admin processes a customer return, restoring stock.
 */
router.post(
  "/:productId/return",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(resolveReservationSchema),
  inventoryController.processReturn
);

/**
 * PATCH /api/inventory/:productId/threshold
 * Admin tunes lowStockThreshold / reorderPoint.
 */
router.patch(
  "/:productId/threshold",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateThresholdSchema),
  inventoryController.updateThresholds
);

/**
 * PATCH /api/inventory/:productId/status
 * Admin discontinues or reactivates inventory tracking for a product.
 */
router.patch(
  "/:productId/status",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateInventoryStatusSchema),
  inventoryController.updateInventoryStatus
);

export default router;