/**
 * cart.controller.js
 *
 * WHO CALLS IT:
 *   cart.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as every prior module: extract from req,
 *   call service, send response. Zero business logic, zero direct Product
 *   or Inventory access — all of that lives in cart.service.js. Every
 *   method is wrapped in try/catch, passing errors to next(error).
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as cartService from "../services/cart.service.js";

// ─── Get Cart ──────────────────────────────────────────────────────────────────
/**
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user._id);

    res.status(200).json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Add To Cart ───────────────────────────────────────────────────────────────
/**
 * POST /api/cart/items
 */
export const addToCart = async (req, res, next) => {
  try {
    const cart = await cartService.addToCart(
      req.user._id,
      req.body.productId,
      req.body.quantity
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Item Quantity ───────────────────────────────────────────────────────
/**
 * PUT /api/cart/items/:productId
 */
export const updateItemQuantity = async (req, res, next) => {
  try {
    const cart = await cartService.updateItemQuantity(
      req.user._id,
      req.params.productId,
      req.body.quantity
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Remove Item ────────────────────────────────────────────────────────────────
/**
 * DELETE /api/cart/items/:productId
 */
export const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeItem(
      req.user._id,
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Clear Cart ─────────────────────────────────────────────────────────────────
/**
 * DELETE /api/cart
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Start Checkout ─────────────────────────────────────────────────────────────
/**
 * POST /api/cart/checkout/start
 * Places a stock reservation hold on every cart item. The future Orders
 * module will pass its own Order _id as req.body.checkoutRef once that
 * module exists; until then this accepts an optional reference and
 * defaults to null.
 */
export const startCheckout = async (req, res, next) => {
  try {
    const cart = await cartService.startCheckout(
      req.user._id,
      req.body.checkoutRef || null
    );

    res.status(200).json({
      success: true,
      message: "Checkout started, stock reserved",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Confirm Checkout ───────────────────────────────────────────────────────────
/**
 * POST /api/cart/checkout/confirm
 */
export const confirmCheckout = async (req, res, next) => {
  try {
    const cart = await cartService.confirmCheckout(req.user._id);

    res.status(200).json({
      success: true,
      message: "Checkout confirmed, stock deducted",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Abandon Checkout ───────────────────────────────────────────────────────────
/**
 * POST /api/cart/checkout/abandon
 */
export const abandonCheckout = async (req, res, next) => {
  try {
    const cart = await cartService.abandonCheckout(req.user._id);

    res.status(200).json({
      success: true,
      message: "Checkout abandoned, stock released",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};