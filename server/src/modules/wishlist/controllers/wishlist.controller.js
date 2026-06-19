/**
 * wishlist.controller.js
 *
 * WHO CALLS IT:
 *   wishlist.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as every prior module: extract from req,
 *   call service, send response. Zero business logic, zero direct Product
 *   or Cart access — all of that lives in wishlist.service.js. Every
 *   method is wrapped in try/catch, passing errors to next(error).
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as wishlistService from "../services/wishlist.service.js";

// ─── Get Wishlist ──────────────────────────────────────────────────────────────
/**
 * GET /api/wishlist
 */
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user._id);

    res.status(200).json({
      success: true,
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Add To Wishlist ────────────────────────────────────────────────────────────
/**
 * POST /api/wishlist/items
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.addToWishlist(
      req.user._id,
      req.body.productId
    );

    res.status(200).json({
      success: true,
      message: "Product saved to wishlist",
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Remove From Wishlist ───────────────────────────────────────────────────────
/**
 * DELETE /api/wishlist/items/:productId
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeFromWishlist(
      req.user._id,
      req.params.productId
    );

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: { wishlist },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Move To Cart ────────────────────────────────────────────────────────────────
/**
 * POST /api/wishlist/items/:productId/move-to-cart
 */
export const moveToCart = async (req, res, next) => {
  try {
    const result = await wishlistService.moveToCart(
      req.user._id,
      req.params.productId,
      req.body.quantity
    );

    res.status(200).json({
      success: true,
      message: "Product moved to cart",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};