/**
 * inventory.service.js
 *
 * WHO CALLS IT:
 *   inventory.controller.js for all admin/HTTP-driven operations.
 *   Future Cart/Orders modules will import reserveStock(), confirmReservation(),
 *   and releaseReservation() directly as part of the checkout flow — this is
 *   the intended cross-module integration point, not a layering violation,
 *   since Inventory OWNS stock and other modules must go through it rather
 *   than touching warehouseStock themselves.
 *
 * WHY IT EXISTS:
 *   Owns every rule about how stock is allowed to change. This is the ONLY
 *   file in the entire codebase permitted to write to Inventory.warehouseStock
 *   or Inventory.reservedStock, and the ONLY file permitted to write to
 *   Product.stockQuantity. Centralising both in one place is what makes the
 *   "Inventory is source of truth, Product is read-only cache" rule
 *   enforceable rather than just a comment.
 *
 * THE ATOMICITY RULE (read before touching this file):
 *   Every stock-changing operation below uses Inventory.findOneAndUpdate()
 *   with a condition baked into the FILTER (not a separate read-then-check),
 *   and the mutation expressed as a MongoDB $inc operator (not a JS
 *   assignment + .save()). This guarantees the check-and-update happens as
 *   one atomic instruction at the database level, eliminating the race
 *   condition where two simultaneous requests both read stale stock and
 *   both proceed. NEVER refactor these into findById() + manual arithmetic
 *   + save() — that reintroduces the exact bug this module exists to prevent.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects or thrown errors with .statusCode attached
 */

import mongoose from "mongoose";
import Inventory from "../models/inventory.model.js";
import StockMovement from "../models/stockMovement.model.js";
import Product from "../../products/models/product.model.js";

// ─── Internal Helper: Sync Product's stockQuantity cache ────────────────────
/**
 * Not exported. Pushes the current availableStock into Product.stockQuantity.
 *
 * WHY findByIdAndUpdate and not findById + save?
 *   We are updating exactly ONE field on Product — the cache. Using
 *   findById().save() would run Product's full pre-save hook chain
 *   (slug regeneration check, isOnSale/thumbnail sync) for a change that
 *   has nothing to do with any of those concerns. findByIdAndUpdate updates
 *   only the targeted field, leaving every other Product write path —
 *   including product.service.js's own updateProduct — completely untouched.
 *
 * THE SYNC DIRECTION IS ONE-WAY. This function is the ONLY place in the
 * entire codebase that writes Product.stockQuantity. product.service.js
 * never writes this field; it only ever reads it for listing/filtering.
 *
 * @param {string} productId      - MongoDB ObjectId of the Product to sync
 * @param {number} availableStock - The computed available stock to cache
 */
const syncProductInventoryCache = async (productId, inventoryDoc) => {
  await Product.findByIdAndUpdate(productId, {
    // Use the virtual property from the inventory model
    stockQuantity: inventoryDoc.availableStock,
    inventoryStatus: inventoryDoc.status,
  });
};

// ─── Internal Helper: Recompute status from current stock ───────────────────
/**
 * Not exported. Derives the correct status string from current stock levels.
 * Called after every stock-changing operation so status is always consistent
 * with the actual numbers — never set directly by a controller for the three
 * automatic states (in_stock/low_stock/out_of_stock). Only "discontinued" is
 * ever set directly, via updateInventoryStatus, since no stock level implies
 * "this product is being phased out" — that's purely an admin decision.
 *
 * @param {Object} inventoryDoc - The inventory document (post-update)
 * @returns {string}            - The correct status for current stock levels
 */
const computeStatus = (inventoryDoc) => {
  if (inventoryDoc.status === "discontinued") return "discontinued";

  const available = inventoryDoc.warehouseStock - inventoryDoc.reservedStock;

  if (available <= 0) return "out_of_stock";
  if (available <= inventoryDoc.lowStockThreshold) return "low_stock";
  return "in_stock";
};

// ─── Internal Helper: Log a stock movement ───────────────────────────────────
/**
 * Not exported. Writes one append-only StockMovement record. Called at the
 * end of every stock-changing operation in this file — never skipped, since
 * the audit trail's value comes entirely from it being complete.
 */
const logMovement = async ({
  inventoryId,
  productId,
  type,
  quantity,
  previousStock,
  newStock,
  reference = null,
  note = "",
  performedBy = null,
}) => {
  await StockMovement.create({
    inventoryId,
    productId,
    type,
    quantity,
    previousStock,
    newStock,
    reference,
    note,
    performedBy,
  });
};

// ─── Create Inventory Record ─────────────────────────────────────────────────
/**
 * Creates the Inventory record for a Product. Called once, typically right
 * after a Product is created (or backfilled for products that predate this
 * module). Enforces the 1:1 relationship — fails if one already exists.
 *
 * @param {Object} data      - Validated fields from createInventorySchema
 * @param {string} adminId   - The _id of the authenticated admin user
 * @returns {Object}         - The newly created inventory document
 */
export const createInventory = async (data, adminId) => {
  const productExists = await Product.findById(data.productId);
  if (!productExists) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  const existingInventory = await Inventory.findOne({
    productId: data.productId,
  });
  if (existingInventory) {
    const error = new Error(
      "An inventory record already exists for this product"
    );
    error.statusCode = 409;
    throw error;
  }

  let inventory = await Inventory.create({
    ...data,
    updatedBy: adminId,
  });

  // Set initial status based on stock
  inventory.status = computeStatus(inventory);
  await inventory.save();

  // Initial sync — even a zero-stock product should reflect 0 on Product,
  // not whatever default was there before Inventory existed.
  await syncProductInventoryCache(inventory.productId, inventory);

  if (inventory.warehouseStock > 0) {
    await logMovement({
      inventoryId: inventory._id,
      productId: inventory.productId,
      type: "restock",
      quantity: inventory.warehouseStock,
      previousStock: 0,
      newStock: inventory.warehouseStock,
      note: "Initial stock on inventory record creation",
      performedBy: adminId,
    });
  }

  return inventory.toJSON();
};

// ─── Get Inventory By Product ID ─────────────────────────────────────────────
/**
 * Fetches the inventory record for a given product, with the computed
 * availableStock virtual included.
 *
 * @param {string} productId - MongoDB ObjectId of the Product
 * @returns {Object}         - Inventory document with virtuals
 */
export const getInventoryByProductId = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error("Invalid product ID format");
    error.statusCode = 400;
    throw error;
  }

  const inventory = await Inventory.findOne({ productId }).lean({
    virtuals: true,
  });

  if (!inventory) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  return inventory;
};

// ─── Get All Inventory (Admin Dashboard Listing) ─────────────────────────────
/**
 * Returns a paginated list of inventory records, optionally filtered by
 * status. Powers the admin "low stock" / "out of stock" dashboard views.
 *
 * @param {Object} query - Validated query params from inventoryQuerySchema
 * @returns {Object}     - { records, pagination }
 */
export const getAllInventory = async (query) => {
  const { page, limit, status, sortBy, sortOrder } = query;

  const filter = {};
  if (status) filter.status = status;

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const skip = (page - 1) * limit;

  const [records, totalCount] = await Promise.all([
    Inventory.find(filter)
      .populate("productId", "name slug thumbnail")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Inventory.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    records,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// â”€â”€â”€ Low Stock Report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * Returns records that need immediate attention: low stock or out of stock.
 *
 * This is intentionally separated from the general inventory listing so the
 * admin dashboard can show a focused operational report without forcing the
 * caller to remember which status filter combination to use every time.
 *
 * @param {Object} query - Pagination and sort options
 * @returns {Object}     - { records, pagination }
 */
export const getLowStockReport = async (query = {}) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const sortOrder = query.sortOrder || "asc";
  const skip = (page - 1) * limit;

  const filter = {
    status: { $in: ["low_stock", "out_of_stock"] },
  };

  const [records, totalCount] = await Promise.all([
    Inventory.find(filter)
      .populate("productId", "name slug thumbnail price salePrice status")
      .sort({ updatedAt: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Inventory.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    records,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Restock ──────────────────────────────────────────────────────────────────
/**
 * Admin adds new physical stock. Always a positive quantity (enforced by
 * restockSchema). This is the simplest stock-changing operation — there is
 * no "insufficient stock" failure mode for an addition, so the atomic
 * $inc is unconditional (no $gte filter needed on the way up, only on the
 * way down).
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {number} quantity   - Positive integer, units being added
 * @param {string} note       - Optional admin note
 * @param {string} adminId    - The requesting admin's _id
 * @returns {Object}          - Updated inventory document
 */
export const restock = async (productId, quantity, note, adminId) => {
  const previous = await Inventory.findOne({ productId });
  if (!previous) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = previous.warehouseStock;

  // Atomic increment — single DB instruction, no read-then-write window.
  const updated = await Inventory.findOneAndUpdate(
    { productId },
    {
      $inc: { warehouseStock: quantity, version: 1 },
      $set: { lastRestockedAt: new Date(), updatedBy: adminId },
    },
    { new: true }
  );

  updated.status = computeStatus(updated);
  await updated.save();

  await syncProductInventoryCache(productId, updated);

  await logMovement({
    inventoryId: updated._id,
    productId,
    type: "restock",
    quantity,
    previousStock,
    newStock: updated.warehouseStock,
    note,
    performedBy: adminId,
  });

  return updated.toJSON();
};

// ─── Manual Adjustment ────────────────────────────────────────────────────────
/**
 * Admin manually corrects stock — e.g. after a physical warehouse count
 * reveals a discrepancy. Quantity can be positive or negative. Unlike
 * restock, a note is REQUIRED (enforced by adjustmentSchema) since this
 * represents an unexplained gap between system and physical reality that
 * future audits need a reason for.
 *
 * If the adjustment would push warehouseStock negative, the atomic filter
 * below rejects it — same overselling-prevention pattern as a sale, just
 * applied to a manual correction instead of a checkout.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {number} quantity   - Signed integer, the adjustment delta
 * @param {string} note       - Required explanation
 * @param {string} adminId    - The requesting admin's _id
 * @returns {Object}          - Updated inventory document
 */
export const adjustStock = async (productId, quantity, note, adminId) => {
  const previous = await Inventory.findOne({ productId });
  if (!previous) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = previous.warehouseStock;

  // Atomic conditional update: only succeeds if the resulting stock would
  // stay non-negative. For a negative adjustment, MongoDB evaluates
  // warehouseStock + quantity >= 0 as part of the filter itself.
  const filter =
    quantity < 0
      ? { productId, warehouseStock: { $gte: Math.abs(quantity) } }
      : { productId };

  const updated = await Inventory.findOneAndUpdate(
    filter,
    {
      $inc: { warehouseStock: quantity, version: 1 },
      $set: { updatedBy: adminId },
    },
    { new: true }
  );

  if (!updated) {
    const error = new Error(
      "Adjustment would result in negative stock. Current stock is insufficient."
    );
    error.statusCode = 409;
    throw error;
  }

  updated.status = computeStatus(updated);
  await updated.save();

  await syncProductInventoryCache(productId, updated);

  await logMovement({
    inventoryId: updated._id,
    productId,
    type: "adjustment",
    quantity,
    previousStock,
    newStock: updated.warehouseStock,
    note,
    performedBy: adminId,
  });

  return updated.toJSON();
};

// ─── Reserve Stock (Checkout Begins) ─────────────────────────────────────────
/**
 * Holds stock against an in-progress checkout, BEFORE payment confirms.
 * This is the operation that prevents two shoppers from both completing
 * checkout on the same last unit.
 *
 * THE CORE OVERSELLING-PREVENTION QUERY:
 *   The filter checks (warehouseStock - reservedStock) >= quantity using
 *   MongoDB's $expr operator, which allows comparing two fields of the SAME
 *   document within the filter itself. This is what makes the entire
 *   check-and-reserve operation atomic — there is no separate read step
 *   that could go stale between checking and reserving.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {number} quantity   - Positive integer, units to reserve
 * @param {string} reference  - Order/Cart ObjectId this reservation is for
 * @returns {Object}          - Updated inventory document
 */
export const reserveStock = async (productId, quantity, reference = null) => {
  const updated = await Inventory.findOneAndUpdate(
    {
      productId,
      status: { $ne: "discontinued" },
      $expr: {
        $gte: [{ $subtract: ["$warehouseStock", "$reservedStock"] }, quantity],
      },
    },
    { $inc: { reservedStock: quantity, version: 1 } },
    { new: true }
  );

  if (!updated) {
    const error = new Error(
      "Insufficient available stock to reserve the requested quantity"
    );
    error.statusCode = 409;
    throw error;
  }

  updated.status = computeStatus(updated);
  await updated.save();

  // NOTE: reserving does NOT change availableStock from the customer's
  // perspective in a way that needs re-syncing differently — availableStock
  // already accounts for reservedStock, so the cache push reflects the drop.
  await syncProductInventoryCache(productId, updated);

  await logMovement({
    inventoryId: updated._id,
    productId,
    type: "reservation",
    quantity: -quantity,
    previousStock: updated.warehouseStock,
    newStock: updated.warehouseStock,
    reference,
  });

  return updated.toJSON();
};

// ─── Confirm Reservation (Payment Succeeds) ──────────────────────────────────
/**
 * Converts a reservation into a permanent deduction. Called when payment
 * confirms. This moves the quantity OUT of reservedStock AND out of
 * warehouseStock simultaneously — the units are now genuinely gone from
 * the warehouse, not just held.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {number} quantity   - Positive integer, units to confirm as sold
 * @param {string} reference  - Order ObjectId this sale is for
 * @returns {Object}          - Updated inventory document
 */
export const confirmReservation = async (
  productId,
  quantity,
  reference = null
) => {
  const previous = await Inventory.findOne({ productId });
  if (!previous) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = previous.warehouseStock;

  // Both decrements happen in the same atomic $inc — warehouseStock loses
  // the sold units permanently, reservedStock releases the hold on them.
  const updated = await Inventory.findOneAndUpdate(
    { productId, reservedStock: { $gte: quantity } },
    {
      $inc: {
        warehouseStock: -quantity,
        reservedStock: -quantity,
        version: 1,
      },
      $set: { lastSoldAt: new Date() },
    },
    { new: true }
  );

  if (!updated) {
    const error = new Error(
      "Cannot confirm: reserved stock is less than the requested quantity"
    );
    error.statusCode = 409;
    throw error;
  }

  updated.status = computeStatus(updated);
  await updated.save();

  await syncProductInventoryCache(productId, updated);

  await logMovement({
    inventoryId: updated._id,
    productId,
    type: "sale",
    quantity: -quantity,
    previousStock,
    newStock: updated.warehouseStock,
    reference,
  });

  return updated.toJSON();
};

// ─── Release Reservation (Payment Fails / Checkout Abandoned) ───────────────
/**
 * Returns previously reserved stock to availability without it ever having
 * been sold. Called when payment fails or a checkout session expires.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {number} quantity   - Positive integer, units to release
 * @param {string} reference  - Order/Cart ObjectId the reservation was for
 * @returns {Object}          - Updated inventory document
 */
export const releaseReservation = async (
  productId,
  quantity,
  reference = null
) => {
  const updated = await Inventory.findOneAndUpdate(
    { productId, reservedStock: { $gte: quantity } },
    { $inc: { reservedStock: -quantity, version: 1 } },
    { new: true }
  );

  if (!updated) {
    const error = new Error(
      "Cannot release: reserved stock is less than the requested quantity"
    );
    error.statusCode = 409;
    throw error;
  }

  updated.status = computeStatus(updated);
  await updated.save();

  await syncProductInventoryCache(productId, updated);

  await logMovement({
    inventoryId: updated._id,
    productId,
    type: "release",
    quantity,
    previousStock: updated.warehouseStock,
    newStock: updated.warehouseStock,
    reference,
  });

  return updated.toJSON();
};

// ─── Process a Return ─────────────────────────────────────────────────────────
/**
 * Customer returns a previously sold item. Stock goes back into
 * warehouseStock directly (it was never in reservedStock — the sale already
 * confirmed and cleared that). Always a positive quantity.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {number} quantity   - Positive integer, units being returned
 * @param {string} reference  - Return/Order ObjectId this applies to
 * @param {string} adminId    - Admin processing the return (if manual)
 * @returns {Object}          - Updated inventory document
 */
export const processReturn = async (
  productId,
  quantity,
  reference = null,
  adminId = null
) => {
  const previous = await Inventory.findOne({ productId });
  if (!previous) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  const previousStock = previous.warehouseStock;

  const updated = await Inventory.findOneAndUpdate(
    { productId },
    { $inc: { warehouseStock: quantity, version: 1 } },
    { new: true }
  );

  updated.status = computeStatus(updated);
  await updated.save();

  await syncProductInventoryCache(productId, updated);

  await logMovement({
    inventoryId: updated._id,
    productId,
    type: "return",
    quantity,
    previousStock,
    newStock: updated.warehouseStock,
    reference,
    performedBy: adminId,
  });

  return updated.toJSON();
};

// ─── Update Thresholds ────────────────────────────────────────────────────────
/**
 * Admin tunes lowStockThreshold and/or reorderPoint without touching actual
 * stock counts. Recomputes status afterward since changing the threshold
 * can itself flip a record from in_stock to low_stock or vice versa.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {Object} updates    - { lowStockThreshold?, reorderPoint? }
 * @param {string} adminId    - The requesting admin's _id
 * @returns {Object}          - Updated inventory document
 */
export const updateThresholds = async (productId, updates, adminId) => {
  const inventory = await Inventory.findOne({ productId });
  if (!inventory) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  Object.assign(inventory, updates);
  inventory.updatedBy = adminId;
  inventory.status = computeStatus(inventory);
  await inventory.save();

  return inventory.toJSON();
};

// ─── Update Status (Discontinue / Reactivate) ────────────────────────────────
/**
 * Directly sets status — used for the "discontinued" transition, which is
 * the one status value that isn't automatically derived from stock numbers.
 * Reactivating FROM discontinued recomputes status from current stock
 * rather than blindly setting "in_stock", since stock may have changed
 * (or be zero) during the discontinued period.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {string} newStatus  - One of the valid status enum values
 * @param {string} adminId    - The requesting admin's _id
 * @returns {Object}          - { productId, status, updatedAt }
 */
export const updateInventoryStatus = async (productId, newStatus, adminId) => {
  const inventory = await Inventory.findOne({ productId });
  if (!inventory) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  if (newStatus === "discontinued") {
    inventory.status = "discontinued";
  } else {
    // Any non-discontinued target gets recomputed from real stock levels —
    // an admin cannot manually force "in_stock" on a product with 0 units.
    inventory.status = computeStatus({ ...inventory.toObject(), status: "in_stock" });
  }

  inventory.updatedBy = adminId;
  await inventory.save();

  return {
    productId: inventory.productId,
    status: inventory.status,
    updatedAt: inventory.updatedAt,
  };
};

// ─── Get Movement History ─────────────────────────────────────────────────────
/**
 * Returns a paginated, newest-first movement history for a product's
 * inventory record. Powers admin "why did stock change?" investigations.
 *
 * @param {string} productId  - MongoDB ObjectId of the Product
 * @param {Object} query      - Validated query params from movementQuerySchema
 * @returns {Object}          - { movements, pagination }
 */
export const getMovementHistory = async (productId, query) => {
  const inventory = await Inventory.findOne({ productId }, "_id");
  if (!inventory) {
    const error = new Error("Inventory record not found for this product");
    error.statusCode = 404;
    throw error;
  }

  const { page, limit, type } = query;
  const filter = { inventoryId: inventory._id };
  if (type) filter.type = type;

  const skip = (page - 1) * limit;

  const [movements, totalCount] = await Promise.all([
    StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performedBy", "name email")
      .lean(),
    StockMovement.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    movements,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};
