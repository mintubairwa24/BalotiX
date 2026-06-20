/**
 * orderItem.model.js
 *
 * WHO CALLS IT:
 *   order.service.js writes OrderItem documents once, at order creation
 *   time (insertMany), and reads them back for getOrderById/getMyOrders.
 *   Never updated after creation — order line items are immutable once
 *   the order exists, mirroring StockMovement and CouponRedemption's
 *   append-only discipline from prior modules.
 *
 * WHY A SEPARATE COLLECTION (not embedded on Order, unlike Cart/Wishlist items):
 *   Cart and Wishlist embed their items because that data is mutable and
 *   short-lived — items get added, removed, and re-priced constantly while
 *   shopping. OrderItem is the opposite: written once, read many times,
 *   and never changes. Keeping it as a separate collection means Order
 *   documents stay small and fast to list (getMyOrders/getAllOrders never
 *   need to load full line-item detail), while a single order's items are
 *   still a fast, indexed lookup (orderId) when full detail IS needed via
 *   getOrderById.
 *
 * WHY SNAPSHOTS, NOT LIVE PRODUCT REFERENCES:
 *   productNameSnapshot, productPriceSnapshot, and productImageSnapshot
 *   are captured once, at order creation, from Cart's own snapshot values
 *   (productPriceSnapshot) and a fresh Product.thumbnail read
 *   (productImageSnapshot). This guarantees "product snapshots must
 *   preserve historical accuracy" — even if the product is later renamed,
 *   repriced, or archived, this order's record of what was actually
 *   purchased never changes. productId is kept purely for traceability
 *   (e.g. "show me all orders containing this product"), never for
 *   re-deriving price or name.
 *
 * INPUT:   Raw JS objects passed to `OrderItem.insertMany([...])`
 * OUTPUT:  Mongoose Document instances — immutable after creation
 */

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      // Which Order this line item belongs to. The join key for the one
      // query this collection exists to serve: "give me every item in
      // order X" — see the index below.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    productId: {
      // Reference kept for traceability and admin reporting (e.g.
      // "how many units of this product have ever been ordered"). NEVER
      // used to look up current price or name — those come exclusively
      // from the snapshot fields below.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productNameSnapshot: {
      // Product name at the moment this order was placed. Copied from
      // CartItem.nameSnapshot, which was itself captured when the item
      // was added to cart — so this is technically a snapshot-of-a-snapshot,
      // and that is correct: the order should reflect what the customer
      // saw when they committed to buying, not any later catalog state.
      type: String,
      required: true,
      trim: true,
    },

    productPriceSnapshot: {
      // Per-unit price at order creation, copied from
      // CartItem.priceSnapshot. lineTotal below is derived from this
      // value at write time, not recalculated on every read.
      type: Number,
      required: true,
      min: 0,
    },

    productImageSnapshot: {
      // Captured fresh from Product.thumbnail at order-creation time
      // (Cart does not store an image snapshot itself, so this is the
      // one field NOT inherited from CartItem). Empty string if the
      // product had no thumbnail set.
      type: String,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    lineTotal: {
      // productPriceSnapshot * quantity, computed once by
      // order.service.js's createOrderFromCart and stored directly —
      // not a virtual — for the same "never depend on future changes"
      // reasoning that governs every other frozen field in this module.
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    // No updatedAt — these records are never updated after creation.
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// orderId: THE core query this collection exists to serve — "fetch every
// line item belonging to this order" — hit every time getOrderById runs.
orderItemSchema.index({ orderId: 1 });

// productId: for admin/reporting queries like "every order that included
// this product," not used on any customer-facing hot path.
orderItemSchema.index({ productId: 1 });

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

export default OrderItem;