/**
 * inventory.controller.js
 *
 * WHO CALLS IT:
 *   inventory.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as product.controller.js and
 *   category.controller.js: extract from req, call service, send response.
 *   Zero business logic, zero direct DB access, zero atomic-update concerns —
 *   all of that lives in inventory.service.js. Every method is wrapped in
 *   try/catch, passing errors to next(error) for the global error handler.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as inventoryService from "../services/inventory.service.js";

// ─── Create Inventory Record ─────────────────────────────────────────────────
/**
 * POST /api/inventory
 * Admin only.
 */
export const createInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.createInventory(
      req.body,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: "Inventory record created successfully",
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Inventory By Product ID ─────────────────────────────────────────────
/**
 * GET /api/inventory/:productId
 * Admin only — exposes warehouseStock/reservedStock detail not meant for
 * public consumption (public stock visibility comes via Product's
 * stockQuantity/isInStock, already exposed by the Product module).
 */
export const getInventoryByProductId = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventoryByProductId(
      req.params.productId
    );

    res.status(200).json({
      success: true,
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Inventory ────────────────────────────────────────────────────────
/**
 * GET /api/inventory
 * Admin only. Paginated dashboard listing, filterable by status.
 */
export const getAllInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getAllInventory(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Restock ──────────────────────────────────────────────────────────────────
/**
 * POST /api/inventory/:productId/restock
 * Admin only.
 */
export const restock = async (req, res, next) => {
  try {
    const inventory = await inventoryService.restock(
      req.params.productId,
      req.body.quantity,
      req.body.note,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Added ${req.body.quantity} units to stock`,
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Manual Adjustment ────────────────────────────────────────────────────────
/**
 * POST /api/inventory/:productId/adjust
 * Admin only.
 */
export const adjustStock = async (req, res, next) => {
  try {
    const inventory = await inventoryService.adjustStock(
      req.params.productId,
      req.body.quantity,
      req.body.note,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Stock adjustment applied successfully",
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Reserve Stock ─────────────────────────────────────────────────────────────
/**
 * POST /api/inventory/:productId/reserve
 * Intended for internal use by the Cart/Orders checkout flow, hence no
 * req.user dependency for "performedBy" — reservations are system-triggered.
 * Still gated by requireAuth at the route level (a logged-in customer
 * triggers their own reservation indirectly through checkout).
 */
export const reserveStock = async (req, res, next) => {
  try {
    const inventory = await inventoryService.reserveStock(
      req.params.productId,
      req.body.quantity,
      req.body.reference
    );

    res.status(200).json({
      success: true,
      message: "Stock reserved successfully",
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Confirm Reservation ───────────────────────────────────────────────────────
/**
 * POST /api/inventory/:productId/confirm
 * Called when payment succeeds, converting a hold into a permanent sale.
 */
export const confirmReservation = async (req, res, next) => {
  try {
    const inventory = await inventoryService.confirmReservation(
      req.params.productId,
      req.body.quantity,
      req.body.reference
    );

    res.status(200).json({
      success: true,
      message: "Reservation confirmed and stock deducted",
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Release Reservation ───────────────────────────────────────────────────────
/**
 * POST /api/inventory/:productId/release
 * Called when payment fails or a checkout session is abandoned.
 */
export const releaseReservation = async (req, res, next) => {
  try {
    const inventory = await inventoryService.releaseReservation(
      req.params.productId,
      req.body.quantity,
      req.body.reference
    );

    res.status(200).json({
      success: true,
      message: "Reservation released back to available stock",
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Process Return ────────────────────────────────────────────────────────────
/**
 * POST /api/inventory/:productId/return
 * Admin only (customer-initiated returns are processed by an admin/warehouse
 * action, not directly by the customer).
 */
export const processReturn = async (req, res, next) => {
  try {
    const inventory = await inventoryService.processReturn(
      req.params.productId,
      req.body.quantity,
      req.body.reference,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Return processed and stock restored",
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Thresholds ────────────────────────────────────────────────────────
/**
 * PATCH /api/inventory/:productId/threshold
 * Admin only.
 */
export const updateThresholds = async (req, res, next) => {
  try {
    const inventory = await inventoryService.updateThresholds(
      req.params.productId,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Inventory thresholds updated successfully",
      data: { inventory },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Status ────────────────────────────────────────────────────────────
/**
 * PATCH /api/inventory/:productId/status
 * Admin only. Primarily for discontinuing/reactivating tracking.
 */
export const updateInventoryStatus = async (req, res, next) => {
  try {
    const result = await inventoryService.updateInventoryStatus(
      req.params.productId,
      req.body.status,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Inventory status updated to "${result.status}"`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Movement History ─────────────────────────────────────────────────────
/**
 * GET /api/inventory/:productId/movements
 * Admin only. Paginated, newest-first audit trail.
 */
export const getMovementHistory = async (req, res, next) => {
  try {
    const result = await inventoryService.getMovementHistory(
      req.params.productId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};