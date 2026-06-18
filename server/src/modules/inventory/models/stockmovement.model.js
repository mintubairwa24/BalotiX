/**
 * stockMovement.model.js
 *
 * WHO CALLS IT:
 *   inventory.service.js writes one StockMovement document at the end of
 *   EVERY stock-changing operation (sale, restock, return, adjustment,
 *   reservation, release). Nothing reads this model on the hot path —
 *   it is queried only by admin reporting endpoints.
 *
 * WHY IT EXISTS:
 *   Inventory.warehouseStock and reservedStock tell you the CURRENT state.
 *   They cannot tell you WHY the state changed, WHEN, or WHO/WHAT caused it.
 *   This collection is the append-only audit log that answers those
 *   questions. Critically, this is intentionally a SEPARATE collection from
 *   Inventory rather than an embedded array on the Inventory document —
 *   embedding would make every Inventory document grow unboundedly over the
 *   product's lifetime, a classic MongoDB anti-pattern that also makes the
 *   1:1 productId lookup (the hottest query in this entire module) slower
 *   as the embedded array grows.
 *
 * INPUT:   Raw JS object passed to `StockMovement.create({...})`
 * OUTPUT:  Mongoose Document instance — records are never updated or deleted
 *          after creation, only ever inserted
 */

import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    inventoryId: {
      // Which Inventory record this movement applies to.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    productId: {
      // Denormalised from Inventory so admin reports can filter movements
      // by product without populating Inventory first.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    type: {
      // sale:        confirmed order, permanent warehouseStock deduction
      // restock:     admin adds new physical stock
      // return:      customer return, stock goes back into warehouseStock
      // adjustment:  manual admin correction (e.g. after a physical count)
      // reservation: stock held against an in-progress checkout
      // release:     a reservation was released (payment failed / cart abandoned)
      type: String,
      enum: {
        values: [
          "sale",
          "restock",
          "return",
          "adjustment",
          "reservation",
          "release",
        ],
        message: "{VALUE} is not a valid stock movement type",
      },
      required: true,
    },

    quantity: {
      // Signed integer. Positive for additions (restock, return, release),
      // negative for deductions (sale, reservation). An "adjustment" can be
      // either sign depending on whether the physical count was higher or
      // lower than the recorded stock.
      type: Number,
      required: true,
    },

    previousStock: {
      // Snapshot of warehouseStock BEFORE this movement was applied.
      // Lets an admin reconstruct the full stock history by replaying
      // movements in order, and lets you sanity-check that
      // previousStock + quantity === newStock for every record.
      type: Number,
      required: true,
    },

    newStock: {
      // Snapshot of warehouseStock AFTER this movement was applied.
      type: Number,
      required: true,
    },

    reference: {
      // The ObjectId of whatever triggered this movement — an Order _id for
      // "sale"/"reservation"/"release", a Return _id for "return", or null
      // for admin-initiated "restock"/"adjustment". Stored as Mixed since it
      // can reference different collections depending on `type`; resolved by
      // the caller (Orders module), not validated here against a fixed ref.
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    note: {
      // Free-text admin note, primarily used on "adjustment" entries to
      // record WHY a manual correction was made (e.g. "damaged in storage").
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    performedBy: {
      // The admin who triggered this movement. Null for system-triggered
      // movements (sales/reservations originating automatically from the
      // Orders module's checkout flow, not a human clicking a button).
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    // No updatedAt needed — these records are never updated after creation.
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// inventoryId + createdAt: the core admin query — "show recent movements for
// this product's inventory record" — sorted newest first. Compound and
// descending on the timestamp so pagination stays fast indefinitely as the
// collection grows, since this collection is append-only and never shrinks.
stockMovementSchema.index({ inventoryId: 1, createdAt: -1 });

// productId: lets admin reports filter movement history by product directly,
// without first resolving the productId -> inventoryId join.
stockMovementSchema.index({ productId: 1, createdAt: -1 });

// type: for admin reports like "all restocks this month" or "all adjustments
// needing review."
stockMovementSchema.index({ type: 1, createdAt: -1 });

const StockMovement = mongoose.model("StockMovement", stockMovementSchema);

export default StockMovement;