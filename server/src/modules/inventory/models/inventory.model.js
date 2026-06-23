/**
 * inventory.model.js
 *
 * WHO CALLS IT:
 *   inventory.service.js imports this model to perform all DB operations.
 *   No other layer (controller, route, or any OTHER module's service)
 *   ever writes to this model directly — see the "sync direction" note below.
 *
 * WHY IT EXISTS:
 *   This is the SOURCE OF TRUTH for stock. product.model.js's stockQuantity
 *   field is a denormalised read-only CACHE — it exists purely so listing
 *   queries don't need to join this collection on every request. Every
 *   real stock change happens here first, then gets pushed into Product's
 *   cache as a side effect. The Product service never writes stockQuantity
 *   directly; only inventory.service.js does, via syncProductStockCache().
 *
 * CONCURRENCY CONTRACT:
 *   warehouseStock must NEVER be modified via findById() + save(). Every
 *   mutation goes through Mongoose's atomic findOneAndUpdate with a $gte
 *   filter guard — see inventory.service.js. This file only defines shape;
 *   it does not enforce atomicity itself (Mongoose schemas can't), but its
 *   field design (single numeric counters, no nested stock objects) is what
 *   makes atomic $inc operations possible in the first place.
 *
 * INPUT:   Raw JS object passed to `new Inventory({...})` or `Inventory.create({...})`
 * OUTPUT:  Mongoose Document instance with virtuals attached
 */

import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    // ── Link to Product (1:1) ───────────────────────────────────────────────
    productId: {
      // Exactly one Inventory record per Product — enforced by the unique
      // index below. This is the join key hit on every cart add and checkout.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    //   unique: true,
    },

    sku: {
      // Mirrored from Product at creation time so admin inventory dashboards
      // can search/sort by SKU without populating Product on every list query.
      // NOT kept in sync automatically if Product's SKU ever changes — but
      // recall SKU is immutable on Product after creation (see
      // product.service.js's updateProduct), so this mirror never goes stale.
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    // ── Stock Counters ───────────────────────────────────────────────────────
    warehouseStock: {
      // THE SOURCE OF TRUTH. Total physical units actually in the warehouse.
      // Only ever changed via atomic $inc operations in the service layer —
      // never read, modified in JS, then saved back (that's the race condition
      // this whole module exists to prevent).
      type: Number,
      required: true,
      default: 0,
      min: [0, "Warehouse stock cannot go negative"],
    },

    reservedStock: {
      // Units currently held against in-progress checkouts that have not yet
      // been confirmed by payment. Exists so a second shopper doesn't see
      // stock as available while a first shopper's payment is still processing.
      // availableStock (virtual, below) subtracts this from warehouseStock.
      type: Number,
      default: 0,
      min: [0, "Reserved stock cannot go negative"],
    },

    lowStockThreshold: {
      // Mirrors Product's default but can be overridden per-inventory-record —
      // e.g. a high-velocity SKU may want a higher threshold than the
      // catalog-wide default set on the Product document.
      type: Number,
      default: 5,
      min: 0,
    },

    reorderPoint: {
      // Stock level that triggers a low-stock alert email to admins.
      // Distinct from lowStockThreshold: lowStockThreshold drives the
      // storefront-facing "isLowStock" UI flag philosophy already established
      // on Product; reorderPoint drives the operational "go buy more stock"
      // alert. They often share the same value but don't have to.
      type: Number,
      default: 5,
      min: 0,
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      // in_stock:     availableStock > lowStockThreshold
      // low_stock:    0 < availableStock <= lowStockThreshold
      // out_of_stock: availableStock === 0
      // discontinued: admin manually retires tracking (e.g. product phase-out)
      // Recomputed by the service after every stock-changing operation —
      // never set directly by a controller.
      type: String,
      enum: {
        values: ["in_stock", "low_stock", "out_of_stock", "discontinued"],
        message: "{VALUE} is not a valid inventory status",
      },
      default: "in_stock",
    },

    // ── Audit Timestamps ──────────────────────────────────────────────────────
    lastRestockedAt: {
      type: Date,
      default: null,
    },

    lastSoldAt: {
      type: Date,
      default: null,
    },

    // ── Concurrency Control ───────────────────────────────────────────────────
    version: {
      // Incremented on every successful stock-changing write via $inc.
      // Gives future callers an optimistic-locking signal ("has this changed
      // since I last read it?") independent of the atomic $gte filter pattern
      // used for the core reserve/confirm/restock operations.
      type: Number,
      default: 0,
    },

    // ── Audit Trail ───────────────────────────────────────────────────────────
    updatedBy: {
      // The admin who performed the most recent manual operation (restock,
      // adjustment, discontinue). Null for system-triggered operations
      // (sales/reservations originating from the Orders module).
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

// availableStock: what customers can actually purchase right now.
// This is the number the Cart/Orders modules should check against —
// never warehouseStock directly, since that includes already-reserved units.
inventorySchema.virtual("availableStock").get(function () {
  return Math.max(0, this.warehouseStock - this.reservedStock);
});

// isLowStock: convenience flag mirroring the naming convention already
// established by Product's own isLowStock virtual.
inventorySchema.virtual("isLowStock").get(function () {
  const available = this.warehouseStock - this.reservedStock;
  return (
    this.status !== "discontinued" &&
    available > 0 &&
    available <= this.lowStockThreshold
  );
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// productId: unique — enforces the 1:1 relationship, and is the join key
// hit on every cart add, checkout, and product detail page load.
inventorySchema.index({ productId: 1 }, { unique: true });

// sku: for admin inventory dashboard search without a Product join
inventorySchema.index({ sku: 1 });

// status: powers the admin "low stock" / "out of stock" dashboard filters —
// a single indexed query across the whole catalog rather than computing
// this on the fly from warehouseStock/reservedStock on every dashboard load.
inventorySchema.index({ status: 1 });

const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);

export default Inventory;
