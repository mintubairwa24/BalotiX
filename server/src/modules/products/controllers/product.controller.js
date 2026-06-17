/**
 * product.controller.js
 *
 * WHO CALLS IT:
 *   product.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Controllers are the bridge between the HTTP layer (Express req/res) and
 *   the business logic layer (the service). They do exactly three things:
 *     1. Extract what the service needs from req (body, params, query, user)
 *     2. Call the appropriate service method
 *     3. Send the HTTP response
 *
 *   ZERO business logic lives here. No DB calls. No conditionals about data.
 *   If you find yourself writing an if statement about product data in a
 *   controller, it belongs in the service instead.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 *
 * ERROR HANDLING:
 *   Every method is wrapped in try/catch. Errors thrown by the service are
 *   passed to next(error), which the global error handler picks up.
 *   The global error handler reads error.statusCode (set by the service)
 *   to determine the HTTP status code.
 */

import * as productService from "../services/product.service.js";

// ─── Create Product ───────────────────────────────────────────────────────────
/**
 * POST /api/products
 * Admin only.
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(
      req.body,          // Validated product data (Zod already ran)
      req.user._id       // Admin's ID from the JWT payload
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Products ─────────────────────────────────────────────────────────
/**
 * GET /api/products
 * Public. Supports pagination, filtering, sorting, and search via query params.
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const result = await productService.getAllProducts(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Product By ID ────────────────────────────────────────────────────────
/**
 * GET /api/products/:id
 * Public.
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Product By Slug ──────────────────────────────────────────────────────
/**
 * GET /api/products/slug/:slug
 * Public. Used by storefront for SEO-friendly product URLs.
 * Admins get an unfiltered view via the query param ?adminView=true
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    // Only honour adminView flag if the requester is actually an admin
    const isAdmin = req.user?.role === "admin";
    const adminView = isAdmin && req.query.adminView === "true";

    const product = await productService.getProductBySlug(
      req.params.slug,
      adminView
    );

    res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Product ───────────────────────────────────────────────────────────
/**
 * PUT /api/products/:id
 * Admin only.
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Product Status ────────────────────────────────────────────────────
/**
 * PATCH /api/products/:id/status
 * Admin only. Changes the product's lifecycle status.
 */
export const updateProductStatus = async (req, res, next) => {
  try {
    const result = await productService.updateProductStatus(
      req.params.id,
      req.body.status,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Product status updated to "${result.status}"`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Featured ──────────────────────────────────────────────────────────
/**
 * PATCH /api/products/:id/featured
 * Admin only. Flips the isFeatured flag.
 */
export const toggleFeatured = async (req, res, next) => {
  try {
    const result = await productService.toggleFeatured(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: result.isFeatured
        ? "Product added to featured"
        : "Product removed from featured",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Archive Product ──────────────────────────────────────────────────────────
/**
 * DELETE /api/products/:id
 * Admin only. This is a SOFT DELETE — sets status to "archived".
 * The product document is NEVER removed from the database.
 */
export const archiveProduct = async (req, res, next) => {
  try {
    const result = await productService.archiveProduct(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: { _id: result._id },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Featured Products ────────────────────────────────────────────────────
/**
 * GET /api/products/featured
 * Public. Returns a curated list for the homepage.
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getFeaturedProducts(limit);

    res.status(200).json({
      success: true,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Search Products ──────────────────────────────────────────────────────────
/**
 * GET /api/products/search?q=iphone
 * Public. Full-text search using MongoDB text index.
 */
export const searchProducts = async (req, res, next) => {
  try {
    const searchTerm = req.query.q;
    const limit = parseInt(req.query.limit) || 20;

    const products = await productService.searchProducts(searchTerm, limit);

    res.status(200).json({
      success: true,
      data: { products, count: products.length },
    });
  } catch (error) {
    next(error);
  }
};