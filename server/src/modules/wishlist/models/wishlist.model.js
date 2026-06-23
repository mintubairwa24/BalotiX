/**
 * wishlist.model.js
 *
 * WHO CALLS IT:
 *   wishlist.service.js imports this model for all DB operations. No other
 *   module ever writes to Wishlist — like Cart, it sits at the leaf of the
 *   dependency graph, consuming Product and Cart but never being consumed.
 *
 * WHY IT EXISTS:
 *   Holds products a customer wants to remember, with NO commitment implied.
 *   This is the key difference from Cart: a wishlist item never triggers a
 *   stock check or reservation at save-time, only at the moment it migrates
 *   into Cart via the moveToCart flow in wishlist.service.js.
 *
 * WHY NO SNAPSHOTS (contrast with cart.model.js):
 *   Cart's items store priceSnapshot/nameSnapshot because a price shown at
 *   add-time is a financial commitment that must survive to checkout
 *   unchanged. A wishlist makes no such promise — if a customer revisits
 *   their wishlist a week later, they SHOULD see the current price, not a
 *   stale one, since nothing was ever being purchased. Carrying a snapshot
 *   field here without a reason to freeze it would be schema bloat, not a
 *   feature — so it is deliberately absent.
 *
 * WHY NO QUANTITY:
 *   A wishlist item is binary — saved or not. "3 of this item are
 *   wishlisted" is not a concept this module needs to express. Quantity
 *   only becomes meaningful once an item moves into Cart, at which point
 *   moveToCart's caller supplies it directly to cartService.addToCart.
 *
 * INPUT:   Raw JS object passed to `new Wishlist({...})` or `Wishlist.create({...})`
 * OUTPUT:  Mongoose Document instance with virtuals attached
 */

import mongoose from "mongoose";

// ─── Wishlist Item Sub-Schema ─────────────────────────────────────────────────
const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// ─── Wishlist Schema ─────────────────────────────────────────────────────────
const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      // One wishlist per customer — enforced by the unique index below.
      // Same indexing strategy as cart.model.js's userId field, since both
      // modules share the identical "get my X" hot-read access pattern.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    //   unique: true,
    },

    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ─────────────────────────────────────────────────────────────────

// itemCount: total saved products, used for wishlist icon badges
wishlistSchema.virtual("itemCount").get(function () {
  return this.items.length;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// userId: unique — enforces 1:1 with User, hit on every "get my wishlist"
// request and on every product detail page that shows a "saved" heart icon.
wishlistSchema.index({ userId: 1 }, { unique: true });

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
