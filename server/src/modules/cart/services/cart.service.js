/**
 * cart.service.js
 *
 * WHO CALLS IT:
 *   cart.controller.js for all HTTP-driven operations. The future Orders
 *   module will call startCheckout()/confirmCheckout()/abandonCheckout()
 *   as part of the payment flow — this is the intended integration point,
 *   not a layering violation, since Cart owns the checkout state transition
 *   on its own document even though Inventory owns the actual stock hold.
 *
 * WHY IT EXISTS:
 *   Owns every rule about what can go into a cart and how it changes.
 *   This is the ONLY file that reads Product for catalog validation and
 *   calls into Inventory's service for stock checks/reservation — neither
 *   Product nor Inventory ever import or call back into this file, keeping
 *   the dependency direction strictly one-way (Cart depends on Product and
 *   Inventory; they remain unaware Cart exists).
 *
 * STOCK VALIDATION RULE (read before touching this file):
 *   Every stock check in this file reads Inventory.availableStock — via
 *   inventoryService.getInventoryByProductId() — never Product.stockQuantity
 *   directly. Product's stockQuantity is a cache that syncs after Inventory
 *   writes complete; under concurrent load there is a narrow window where
 *   it could be stale. Inventory is always queried as the freshest source
 *   for any decision that gates a write.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects (Cart documents with virtuals) or thrown errors
 */

import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../../products/models/product.model.js";
import * as inventoryService from "../../inventory/services/inventory.service.js";

// ─── Internal Helper: Get or create a user's cart ────────────────────────────
/**
 * Not exported. Carts are created lazily — there is no explicit "create
 * cart" endpoint, since an empty cart has no meaningful state to persist
 * until the first item is added. Every mutating operation below calls this
 * first to guarantee a document exists before modifying it.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Document}    - The user's Cart document (Mongoose doc, not lean)
 */
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

// ─── Internal Helper: Validate a product is addable to a cart ───────────────
/**
 * Not exported. Runs the two-part validation every add/update operation
 * needs: the product must exist and be "active" (Cart cannot add a product
 * that has been pulled from sale, drafted, or archived), and the requested
 * quantity must not exceed Inventory's availableStock — read fresh from
 * Inventory, never from Product's stockQuantity cache.
 *
 * @param {string} productId - MongoDB ObjectId of the Product
 * @param {number} quantity  - Requested quantity for this operation
 * @returns {Object}         - { product, availableStock } for the caller to use
 */
const validateProductForCart = async (productId, quantity) => {
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

  if (product.status !== "active") {
    const error = new Error("This product is not currently available for purchase");
    error.statusCode = 400;
    throw error;
  }

  // Read fresh from Inventory — never trust Product.stockQuantity for a
  // decision that gates a write, per the rule stated in the file header.
  let inventory;
  try {
    inventory = await inventoryService.getInventoryByProductId(productId);
  } catch (err) {
    // No inventory record exists yet for this product (e.g. it predates
    // the Inventory module, or was never backfilled). Treat as unavailable
    // rather than allowing an unvalidated add.
    const error = new Error("This product is not available for purchase right now");
    error.statusCode = 409;
    throw error;
  }

  const availableStock = inventory.warehouseStock - inventory.reservedStock;

  if (availableStock < quantity) {
    const error = new Error(
      `Only ${Math.max(0, availableStock)} unit(s) available — requested ${quantity}`
    );
    error.statusCode = 409;
    throw error;
  }

  return { product, availableStock };
};

// ─── Get Cart ──────────────────────────────────────────────────────────────────
/**
 * Returns the authenticated user's cart with virtuals (itemCount,
 * totalQuantity, subtotal). Creates an empty cart on first access rather
 * than returning a 404 — an empty cart is a normal, expected state for any
 * logged-in customer who hasn't added anything yet.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Object}      - Cart document with virtuals
 */
export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return cart.toJSON();
};

// ─── Add To Cart ───────────────────────────────────────────────────────────────
/**
 * Adds a product to the cart, or increments quantity if it's already present.
 *
 * DUPLICATE PREVENTION:
 *   The cart's items array is scanned for an existing line item with the
 *   same productId. If found, quantities are merged into one line rather
 *   than allowing two separate entries for the same product — this is what
 *   "prevent duplicate cart items" means in practice for an embedded-array
 *   design (there is no unique index possible on a field inside an array
 *   the way there is on a top-level field, so this check is enforced here
 *   in the service, not at the schema level).
 *
 * @param {string} userId    - MongoDB ObjectId of the authenticated user
 * @param {string} productId - MongoDB ObjectId of the Product to add
 * @param {number} quantity  - Quantity to add
 * @returns {Object}         - Updated cart document with virtuals
 */
export const addToCart = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);

  if (cart.status === "checkout_in_progress") {
    const error = new Error(
      "Cannot modify cart while checkout is in progress"
    );
    error.statusCode = 409;
    throw error;
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  // The quantity that must be coverable by available stock is the NEW total
  // (existing + requested), not just the incremental request — adding 2 more
  // of a product that already has 3 in the cart needs availableStock >= 5.
  const requestedTotal = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  const { product } = await validateProductForCart(productId, requestedTotal);

  if (existingItem) {
    existingItem.quantity = requestedTotal;
    // Refresh the snapshot to the current effective price on every add —
    // a deliberate choice: re-adding an already-present item is the one
    // natural moment to re-sync price without requiring a separate
    // "refresh cart" action from the customer.
    existingItem.priceSnapshot = product.effectivePrice;
    existingItem.nameSnapshot = product.name;
  } else {
    cart.items.push({
      productId: product._id,
      quantity,
      priceSnapshot: product.effectivePrice,
      nameSnapshot: product.name,
    });
  }

  await cart.save();
  return cart.toJSON();
};

// ─── Update Item Quantity ───────────────────────────────────────────────────────
/**
 * Sets a line item's quantity to an exact new value (not incremental).
 * Re-runs the same stock validation as addToCart, since increasing quantity
 * is functionally a fresh stock request for the delta.
 *
 * @param {string} userId    - MongoDB ObjectId of the authenticated user
 * @param {string} productId - MongoDB ObjectId of the Product to update
 * @param {number} quantity  - New exact quantity (must be > 0; see validation)
 * @returns {Object}         - Updated cart document with virtuals
 */
export const updateItemQuantity = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);

  if (cart.status === "checkout_in_progress") {
    const error = new Error(
      "Cannot modify cart while checkout is in progress"
    );
    error.statusCode = 409;
    throw error;
  }

  const item = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (!item) {
    const error = new Error("This product is not in your cart");
    error.statusCode = 404;
    throw error;
  }

  const { product } = await validateProductForCart(productId, quantity);

  item.quantity = quantity;
  // Re-sync price snapshot on every quantity change — same reasoning as
  // addToCart's merge path.
  item.priceSnapshot = product.effectivePrice;
  item.nameSnapshot = product.name;

  await cart.save();
  return cart.toJSON();
};

// ─── Remove Item ────────────────────────────────────────────────────────────────
/**
 * Removes a single line item by productId. No stock validation needed —
 * removal never requires checking availability, only existence of the
 * line item being removed.
 *
 * @param {string} userId    - MongoDB ObjectId of the authenticated user
 * @param {string} productId - MongoDB ObjectId of the Product to remove
 * @returns {Object}         - Updated cart document with virtuals
 */
export const removeItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);

  if (cart.status === "checkout_in_progress") {
    const error = new Error(
      "Cannot modify cart while checkout is in progress"
    );
    error.statusCode = 409;
    throw error;
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    const error = new Error("This product is not in your cart");
    error.statusCode = 404;
    throw error;
  }

  cart.items.splice(itemIndex, 1);
  await cart.save();

  return cart.toJSON();
};

// ─── Clear Cart ─────────────────────────────────────────────────────────────────
/**
 * Empties the entire items array. Used by the customer's explicit "empty
 * cart" action, and intended to be called by the future Orders module
 * after a successful checkout confirms — this service does not call it
 * automatically on confirmCheckout() below, since Orders should decide
 * exactly when the cart is safe to clear relative to its own write.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Object}       - Updated (empty) cart document with virtuals
 */
export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  if (cart.status === "checkout_in_progress") {
    const error = new Error(
      "Cannot clear cart while checkout is in progress"
    );
    error.statusCode = 409;
    throw error;
  }

  cart.items = [];
  await cart.save();

  return cart.toJSON();
};

// ─── Start Checkout ───────────────────────────────────────────────────────────
/**
 * Transitions the cart into checkout_in_progress and places a stock
 * reservation hold on every line item via Inventory's existing atomic
 * reserveStock operation — Cart does not reimplement any locking logic,
 * it only calls the already-built Inventory function for each item.
 *
 * PARTIAL FAILURE HANDLING:
 *   If any single item fails to reserve (e.g. another customer took the
 *   last unit between cart-add and checkout-start), every reservation
 *   already granted in this same call is rolled back via releaseReservation
 *   before the error is thrown — the customer should never end up holding
 *   a reservation on item A merely because item B couldn't be reserved.
 *
 * @param {string} userId      - MongoDB ObjectId of the authenticated user
 * @param {string} checkoutRef - ObjectId of the Order being created (passed
 *                                in by the future Orders module's checkout flow)
 * @returns {Object}           - Updated cart document, now checkout_in_progress
 */
export const startCheckout = async (userId, checkoutRef = null) => {
  const cart = await getOrCreateCart(userId);

  if (cart.status === "checkout_in_progress") {
    const error = new Error("Checkout is already in progress for this cart");
    error.statusCode = 409;
    throw error;
  }

  if (cart.items.length === 0) {
    const error = new Error("Cannot checkout an empty cart");
    error.statusCode = 400;
    throw error;
  }

  const reservedSoFar = [];

  for (const item of cart.items) {
    try {
      await inventoryService.reserveStock(
        item.productId,
        item.quantity,
        checkoutRef
      );
      reservedSoFar.push(item);
    } catch (err) {
      // Roll back every reservation already granted in this loop before
      // surfacing the failure — see PARTIAL FAILURE HANDLING above.
      for (const reservedItem of reservedSoFar) {
        await inventoryService.releaseReservation(
          reservedItem.productId,
          reservedItem.quantity,
          checkoutRef
        );
      }

      const error = new Error(
        `Unable to reserve stock for "${item.nameSnapshot}": ${err.message}`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  cart.status = "checkout_in_progress";
  cart.checkoutRef = checkoutRef;
  await cart.save();

  return cart.toJSON();
};

// ─── Confirm Checkout ─────────────────────────────────────────────────────────
/**
 * Converts every reservation into a permanent sale via Inventory's
 * confirmReservation, intended to be called once payment succeeds.
 * Does NOT clear the cart itself — see clearCart's doc comment for why
 * that responsibility is left to the caller (the future Orders module).
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Object}      - Updated cart document (still holds items, status reset)
 */
export const confirmCheckout = async (userId) => {
  const cart = await getOrCreateCart(userId);

  if (cart.status !== "checkout_in_progress") {
    const error = new Error("No checkout is currently in progress for this cart");
    error.statusCode = 400;
    throw error;
  }

  for (const item of cart.items) {
    await inventoryService.confirmReservation(
      item.productId,
      item.quantity,
      cart.checkoutRef
    );
  }

  cart.status = "active";
  cart.checkoutRef = null;
  await cart.save();

  return cart.toJSON();
};

// ─── Abandon Checkout ─────────────────────────────────────────────────────────
/**
 * Releases every reservation back to available stock via Inventory's
 * releaseReservation, intended to be called when payment fails or a
 * checkout session times out. Cart returns to "active" with all items
 * still intact — abandoning checkout never removes items from the cart,
 * it only releases the stock hold so other customers can purchase them.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Object}      - Updated cart document, status reset to active
 */
export const abandonCheckout = async (userId) => {
  const cart = await getOrCreateCart(userId);

  if (cart.status !== "checkout_in_progress") {
    const error = new Error("No checkout is currently in progress for this cart");
    error.statusCode = 400;
    throw error;
  }

  for (const item of cart.items) {
    await inventoryService.releaseReservation(
      item.productId,
      item.quantity,
      cart.checkoutRef
    );
  }

  cart.status = "active";
  cart.checkoutRef = null;
  await cart.save();

  return cart.toJSON();
};