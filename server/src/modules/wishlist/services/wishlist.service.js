/**
 * wishlist.service.js
 *
 * WHO CALLS IT:
 *   wishlist.controller.js for all HTTP-driven operations. No future module
 *   is expected to call into this service the way Orders will eventually
 *   call into Cart — Wishlist is a terminal consumer in the dependency graph.
 *
 * WHY IT EXISTS:
 *   Owns every rule about what can be saved and how it migrates to Cart.
 *   This is the ONLY file that reads Product for existence/status checks
 *   and calls cartService.addToCart for the move-to-cart flow. Neither
 *   Product nor Cart ever import or call back into this file, keeping the
 *   dependency direction strictly one-way.
 *
 * WHY NO INVENTORY INTEGRATION:
 *   Unlike cart.service.js, this file never imports inventoryService.
 *   Saving a product to a wishlist expresses interest, not a stock claim —
 *   there is nothing to reserve or validate against Inventory at save-time.
 *   The only moment stock matters is moveToCart, and that check happens for
 *   free as a side effect of calling cartService.addToCart, which already
 *   enforces it internally. Reimplementing that check here would duplicate
 *   logic that already exists and risk the two checks drifting out of sync.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects (Wishlist documents with virtuals) or thrown errors
 */

import mongoose from "mongoose";
import Wishlist from "../models/wishlist.model.js";
import Product from "../../products/models/product.model.js";
import * as cartService from "../../cart/services/cart.service.js";

// ─── Internal Helper: Get or create a user's wishlist ────────────────────────
/**
 * Not exported. Same lazy-creation pattern as cart.service.js's
 * getOrCreateCart — there is no explicit "create wishlist" endpoint, since
 * an empty wishlist has no meaningful state to persist until the first
 * item is saved.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Document}    - The user's Wishlist document (Mongoose doc, not lean)
 */
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ userId, items: [] });
  }
  return wishlist;
};

// ─── Get Wishlist ──────────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's wishlist with virtuals (itemCount).
 * Creates an empty wishlist on first access rather than 404ing — an empty
 * wishlist is a normal state for any customer who hasn't saved anything yet.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Object}      - Wishlist document with virtuals
 */
export const getWishlist = async (userId) => {
  const wishlist = await getOrCreateWishlist(userId);
  return wishlist.toJSON();
};

// ─── Add To Wishlist ────────────────────────────────────────────────────────────
/**
 * Saves a product to the wishlist.
 *
 * VALIDATION BAR (deliberately lighter than Cart's):
 *   Only rejects products that are "archived" — fully retired from the
 *   catalog. A customer CAN wishlist a product that is currently
 *   "inactive" or "out_of_stock", since wanting something that is
 *   momentarily unavailable is exactly the use case a wishlist exists for.
 *   Cart enforces "active"-only because adding to cart implies near-term
 *   purchase intent; wishlist does not carry that implication.
 *
 * DUPLICATE PREVENTION:
 *   If the product is already saved, this is treated as a no-op that
 *   returns the existing wishlist unchanged — not an error. "I already
 *   saved this" is not a failure state from the customer's perspective,
 *   unlike Cart where re-adding merges quantities (a meaningful change).
 *
 * @param {string} userId    - MongoDB ObjectId of the authenticated user
 * @param {string} productId - MongoDB ObjectId of the Product to save
 * @returns {Object}         - Updated wishlist document with virtuals
 */
export const addToWishlist = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error("Invalid product ID format");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (product.status === "archived") {
    const error = new Error("This product is no longer available");
    error.statusCode = 400;
    throw error;
  }

  const wishlist = await getOrCreateWishlist(userId);

  const alreadySaved = wishlist.items.some(
    (item) => item.productId.toString() === productId
  );

  if (alreadySaved) {
    // No-op — return current state rather than throwing. See doc comment.
    return wishlist.toJSON();
  }

  wishlist.items.push({ productId: product._id });
  await wishlist.save();

  return wishlist.toJSON();
};

// ─── Remove From Wishlist ───────────────────────────────────────────────────────
/**
 * Removes a single saved product by productId.
 *
 * @param {string} userId    - MongoDB ObjectId of the authenticated user
 * @param {string} productId - MongoDB ObjectId of the Product to remove
 * @returns {Object}         - Updated wishlist document with virtuals
 */
export const removeFromWishlist = async (userId, productId) => {
  const wishlist = await getOrCreateWishlist(userId);

  const itemIndex = wishlist.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    const error = new Error("This product is not in your wishlist");
    error.statusCode = 404;
    throw error;
  }

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  return wishlist.toJSON();
};

// ─── Move To Cart ────────────────────────────────────────────────────────────────
/**
 * Migrates a saved product into the customer's cart.
 *
 * ORDERING IS DELIBERATE:
 *   cartService.addToCart is called FIRST. Only if it succeeds is the item
 *   removed from the wishlist. If Cart's own validation rejects the item
 *   (product went out of stock, or was deactivated, since it was saved),
 *   the wishlist item is left untouched and the error surfaces to the
 *   customer. This guarantees a customer never loses a saved item due to a
 *   failed move-to-cart attempt — the wishlist remains the safe fallback.
 *
 * NO STOCK CHECK HERE:
 *   This function performs no Inventory lookups of its own. Every stock
 *   and status rule Cart enforces (active-only, availableStock check) runs
 *   automatically inside cartService.addToCart — see file header for why
 *   duplicating that logic here would be a maintenance risk, not a feature.
 *
 * @param {string} userId    - MongoDB ObjectId of the authenticated user
 * @param {string} productId - MongoDB ObjectId of the Product to move
 * @param {number} quantity  - Quantity to add to cart (defaults to 1 in validation)
 * @returns {Object}         - { wishlist, cart } — both updated documents
 */
export const moveToCart = async (userId, productId, quantity) => {
  const wishlist = await getOrCreateWishlist(userId);

  const itemIndex = wishlist.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    const error = new Error("This product is not in your wishlist");
    error.statusCode = 404;
    throw error;
  }

  // Call Cart's existing, already-validated addToCart first. If this
  // throws (out of stock, inactive, etc.), the error propagates up and
  // the wishlist item below is never touched.
  const cart = await cartService.addToCart(userId, productId, quantity);

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  return { wishlist: wishlist.toJSON(), cart };
};