/**
 * @file inventory.seeder.js
 * @location src/scripts/seed/seeders/inventory.seeder.js
 *
 * WHY THIS FILE EXISTS:
 * Per your architecture (Question 5), Inventory is a SEPARATE collection
 * with a 1:1 relationship to Product — it is NOT embedded. This file is
 * the seed-time equivalent of your inventory.service.js: it creates the
 * Inventory document AND syncs Product.stockQuantity, because the seed
 * script bypasses your normal service layer entirely.
 *
 * WHY THIS IS ITS OWN FILE (not inlined in product.seeder.js):
 * Inventory creation is a distinct domain concern with its own sync
 * responsibility. Keeping it separate means if your Inventory schema
 * changes, only this file needs updating — product.seeder.js stays
 * untouched. It also mirrors your actual module boundary (Products vs
 * Inventory are separate modules in src/modules/).
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 * - `Inventory.insertMany()` — true bulk insert. Safe here because,
 *   unlike Product, nothing in your Inventory schema depends on a
 *   pre-save hook for correctness (no slug/thumbnail-style derived fields
 *   were specified) — insertMany is the right performance choice.
 * - `Product.bulkWrite()` — a single bulk operation issuing N `updateOne`
 *   ops (one per product) to sync stockQuantity, matching the EXACT
 *   two-step process your doc specifies: create Inventory, then update
 *   Product.stockQuantity to match warehouseStock.
 *
 * WHY bulkWrite INSTEAD OF A LOOP OF findByIdAndUpdate:
 * Your original requirement was "use bulk operations where possible for
 * performance." A loop of 70 individual findByIdAndUpdate calls is 70
 * round-trips to MongoDB. bulkWrite batches all 70 updates into ONE
 * round-trip — this is the correct production pattern at this volume.
 *
 * FUTURE MODULE REUSE:
 * createInventoryRecords() takes a plain array of {productId, sku, stock}
 * — no seed-specific coupling. A future "Bulk Restock" admin tool could
 * reuse this exact function signature.
 */

import { Inventory, Product } from "../models.registry.js";
import { logger } from "../utils/logger.util.js";
import SEED_CONFIG from "../seed.config.js";

/**
 * createInventoryRecords
 * Given an array of created products (each with _id, sku, stockQuantity),
 * creates matching Inventory documents and syncs Product.stockQuantity.
 *
 * @param {Array<{_id: ObjectId, sku: string, stockQuantity: number}>} products
 * @returns {Promise<number>} count of inventory records created
 */
export async function createInventoryRecords(products) {
  if (products.length === 0) return 0;

  // ── STEP 1: Build Inventory documents ──────────────────────────────
  const inventoryDocs = products.map((product) => ({
    productId: product._id,
    sku: product.sku,
    warehouseStock: product.stockQuantity,
    reservedStock: 0,
    lowStockThreshold: SEED_CONFIG.DEFAULT_LOW_STOCK_THRESHOLD,
    reorderPoint: SEED_CONFIG.DEFAULT_REORDER_POINT,
    status: SEED_CONFIG.INVENTORY_STATUS,
    lastRestockedAt: new Date(),
  }));

  // Bulk insert — no document middleware dependency, safe to use insertMany
  const createdInventory = await Inventory.insertMany(inventoryDocs, {
    ordered: false, // continue inserting remaining docs even if one fails (e.g. dup key)
  });

  logger.success(`Created ${createdInventory.length} inventory records`);

  // ── STEP 2: Bulk-sync Product.stockQuantity ────────────────────────
  // Replicates inventory.service.js's syncProductStockCache(), which the
  // seed script must do manually since it bypasses the service layer.
  const bulkOps = products.map((product) => ({
    updateOne: {
      filter: { _id: product._id },
      update: { $set: { stockQuantity: product.stockQuantity } },
    },
  }));

  const bulkResult = await Product.bulkWrite(bulkOps);
  logger.success(
    `Synced stockQuantity on ${bulkResult.modifiedCount} products`
  );

  return createdInventory.length;
}

export default createInventoryRecords;