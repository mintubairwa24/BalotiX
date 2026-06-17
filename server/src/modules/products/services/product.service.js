/**
 * product.service.js
 *
 * WHO CALLS IT:
 *   product.controller.js — the controller delegates ALL business logic here.
 *   Nothing else calls this file directly.
 *
 * WHY IT EXISTS:
 *   This is the brain of the Product Module. All business rules, database
 *   operations, and decision-making live here. Controllers are deliberately
 *   kept thin — they receive a request and return a response. This service
 *   answers the question: "what should actually happen?"
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects (Mongoose documents converted to JSON) or thrown errors
 *
 * PATTERN:
 *   Every method either returns data or throws a descriptive Error.
 *   The controller's try/catch (or the global error handler) catches thrown errors.
 *   We never return { success: false } from a service — we throw.
 */

import mongoose from "mongoose";
import Product from "../models/product.model.js";

// ─── Create Product ───────────────────────────────────────────────────────────
/**
 * Creates a new product document in the database.
 *
 * FLOW:
 *   1. Check SKU uniqueness (before hitting DB unique index for a cleaner error)
 *   2. Build the product document with the requesting admin's ID
 *   3. Save — the pre-save hooks generate slug and sync derived fields
 *   4. Return the saved document
 *
 * @param {Object} productData  - Validated product fields from Zod schema
 * @param {string} adminId      - The _id of the authenticated admin user
 * @returns {Object}            - The newly created product document
 */
export const createProduct = async (productData, adminId) => {
  // Check SKU uniqueness before attempting save.
  // The unique index would also catch this, but a pre-check gives us
  // a cleaner, more descriptive error message than a MongoDB duplicate key error.
  const skuExists = await Product.findOne({
    sku: productData.sku.toUpperCase(),
  });
  if (skuExists) {
    const error = new Error(`SKU "${productData.sku}" is already in use`);
    error.statusCode = 409;
    throw error;
  }

  const product = new Product({
    ...productData,
    createdBy: adminId,
    updatedBy: adminId,
  });

  // .save() triggers pre-save hooks: slug generation + derived field sync
  await product.save();

  return product.toJSON();
};

// ─── Get All Products (with Filtering, Sorting, Pagination) ──────────────────
/**
 * Returns a paginated list of products based on query parameters.
 *
 * This is the most complex method in the service because the listing endpoint
 * must handle multiple simultaneous concerns: filtering, sorting, searching,
 * and pagination — all from a single MongoDB query.
 *
 * PERFORMANCE NOTES:
 *   - Projection limits returned fields to what the listing page actually needs
 *   - Promise.all runs the data query and the count query in parallel
 *   - The compound index { status, categoryId, price } covers the hot path
 *
 * @param {Object} query - Validated query params from productQuerySchema
 * @returns {Object}     - { products, pagination }
 */
export const getAllProducts = async (query) => {
  const {
    page,
    limit,
    categoryId,
    status,
    brand,
    minPrice,
    maxPrice,
    inStock,
    isFeatured,
    tags,
    sortBy,
    sortOrder,
    search,
  } = query;

  // ── Build Filter Object ──────────────────────────────────────────────────
  // Start with an empty filter and add conditions only if the param is present.
  // This keeps the query lean — unused conditions don't appear at all.
  const filter = {};

  if (status) filter.status = status;
  if (categoryId) filter.categoryId = new mongoose.Types.ObjectId(categoryId);
  if (brand) filter.brand = { $regex: brand, $options: "i" }; // Case-insensitive
  if (isFeatured !== undefined) filter.isFeatured = isFeatured;

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  // Stock filter — checks the denormalised stockQuantity on the product doc
  if (inStock !== undefined) {
    if (inStock) {
      filter.$or = [
        { trackInventory: false },
        { stockQuantity: { $gt: 0 } },
        { allowBackorder: true },
      ];
    } else {
      filter.trackInventory = true;
      filter.stockQuantity = 0;
      filter.allowBackorder = false;
    }
  }

  // Tags filter — match products that have ALL specified tags
  if (tags && tags.length > 0) {
    filter.tags = { $all: tags };
  }

  // Full-text search using the MongoDB text index
  // Text search adds a relevance score we can sort by
  if (search) {
    filter.$text = { $search: search };
  }

  // ── Build Sort Object ────────────────────────────────────────────────────
  const sort = {};

  if (search && sortBy === "createdAt") {
    // When searching, default to relevance score (textScore) for best results
    sort.score = { $meta: "textScore" };
  } else {
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;
  }

  // ── Projection ────────────────────────────────────────────────────────────
  // Only return fields that the product listing card actually needs.
  // Never return description, attributes, dimensions on a listing page —
  // those are fetched on the single-product detail page only.
  const projection = {
    name: 1,
    slug: 1,
    thumbnail: 1,
    price: 1,
    salePrice: 1,
    isOnSale: 1,
    currency: 1,
    brand: 1,
    status: 1,
    isFeatured: 1,
    averageRating: 1,
    totalReviews: 1,
    stockQuantity: 1,
    categoryId: 1,
    createdAt: 1,
    // Include textScore projection only when doing a text search
    ...(search && { score: { $meta: "textScore" } }),
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const skip = (page - 1) * limit;

  // Run the data query and count query in parallel — no need to wait for one
  // to finish before starting the other.
  const [products, totalCount] = await Promise.all([
    Product.find(filter, projection).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    products,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Get Product By ID ────────────────────────────────────────────────────────
/**
 * Fetches a single product by its MongoDB _id.
 * Returns the full document (including description, attributes, etc.)
 * for the product detail page.
 *
 * @param {string} productId  - MongoDB ObjectId string
 * @returns {Object}          - Full product document with category populated
 */
export const getProductById = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error("Invalid product ID format");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId)
    .populate("categoryId", "name slug") // Only pull name and slug from Category
    .populate("createdBy", "name email")
    .lean({ virtuals: true }); // Include virtuals (effectivePrice, isInStock, etc.)

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

// ─── Get Product By Slug ──────────────────────────────────────────────────────
/**
 * Fetches a single product by its URL slug.
 * Used by the public storefront — product URLs are slug-based for SEO.
 *
 * Only returns active products to the public.
 * Admins can fetch by ID to see any status.
 *
 * @param {string} slug       - URL slug (e.g. "apple-iphone-15-pro")
 * @param {boolean} adminView - If true, bypass the status=active filter
 * @returns {Object}          - Full product document
 */
export const getProductBySlug = async (slug, adminView = false) => {
  const filter = { slug };

  // Public users should only see active products via slug
  if (!adminView) {
    filter.status = "active";
  }

  const product = await Product.findOne(filter)
    .populate("categoryId", "name slug")
    .lean({ virtuals: true });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

// ─── Update Product ───────────────────────────────────────────────────────────
/**
 * Partially updates a product document.
 *
 * IMPORTANT RULES:
 *   1. SKU is immutable after creation — we strip it from the update payload
 *   2. We use findById + save (not findByIdAndUpdate) so pre-save hooks run
 *   3. updatedBy is always set to the requesting admin
 *
 * WHY findById + save instead of findByIdAndUpdate?
 *   findByIdAndUpdate bypasses Mongoose middleware (pre-save hooks).
 *   Our slug generation and field sync hooks must run on every update.
 *   Using save() guarantees they fire.
 *
 * @param {string} productId    - MongoDB ObjectId string
 * @param {Object} updateData   - Partial product fields (validated by Zod)
 * @param {string} adminId      - The _id of the authenticated admin user
 * @returns {Object}            - Updated product document
 */
export const updateProduct = async (productId, updateData, adminId) => {
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
    const error = new Error("Archived products cannot be updated");
    error.statusCode = 400;
    throw error;
  }

  // Strip SKU from update payload — SKU is immutable once set
  const { sku, ...safeUpdateData } = updateData;
  if (sku && sku !== product.sku) {
    const error = new Error("SKU cannot be changed after creation");
    error.statusCode = 400;
    throw error;
  }

  // Apply each field from the update payload to the document
  Object.assign(product, safeUpdateData);
  product.updatedBy = adminId;

  // .save() triggers pre-save hooks (slug regeneration if name changed,
  // isOnSale sync, thumbnail sync)
  await product.save();

  return product.toJSON();
};

// ─── Update Product Status ────────────────────────────────────────────────────
/**
 * Changes a product's lifecycle status.
 * Separated from updateProduct for a focused, auditable API surface.
 *
 * @param {string} productId  - MongoDB ObjectId string
 * @param {string} newStatus  - One of the valid status enum values
 * @param {string} adminId    - The requesting admin's _id
 * @returns {Object}          - Updated product document (id, status, updatedAt only)
 */
export const updateProductStatus = async (productId, newStatus, adminId) => {
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

  // Prevent transitioning OUT of archived — archival is terminal
  if (product.status === "archived" && newStatus !== "archived") {
    const error = new Error(
      "Archived products cannot be restored. Create a new product instead."
    );
    error.statusCode = 400;
    throw error;
  }

  product.status = newStatus;
  product.updatedBy = adminId;
  await product.save();

  return {
    _id: product._id,
    status: product.status,
    updatedAt: product.updatedAt,
  };
};

// ─── Toggle Featured ──────────────────────────────────────────────────────────
/**
 * Toggles the isFeatured flag on a product.
 *
 * @param {string} productId  - MongoDB ObjectId string
 * @param {string} adminId    - The requesting admin's _id
 * @returns {Object}          - { _id, isFeatured }
 */
export const toggleFeatured = async (productId, adminId) => {
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

  product.isFeatured = !product.isFeatured;
  product.updatedBy = adminId;
  await product.save();

  return { _id: product._id, isFeatured: product.isFeatured };
};

// ─── Archive Product (Soft Delete) ───────────────────────────────────────────
/**
 * Archives a product — this is the ONLY form of deletion in the system.
 *
 * WHY NO HARD DELETE?
 *   Orders, Cart, and Wishlist documents reference products by _id.
 *   Hard-deleting a product breaks those references. Old orders would show
 *   "Unknown Product" instead of the item the customer actually purchased.
 *   Archiving keeps the document in the DB but hides it from all public queries.
 *
 * @param {string} productId  - MongoDB ObjectId string
 * @param {string} adminId    - The requesting admin's _id
 * @returns {Object}          - Confirmation with archived product id
 */
export const archiveProduct = async (productId, adminId) => {
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
    const error = new Error("Product is already archived");
    error.statusCode = 400;
    throw error;
  }

  product.status = "archived";
  product.isFeatured = false; // Remove from featured sections automatically
  product.updatedBy = adminId;
  await product.save();

  return {
    _id: product._id,
    message: "Product archived successfully",
  };
};

// ─── Get Featured Products ────────────────────────────────────────────────────
/**
 * Returns active featured products for the homepage.
 * Uses the compound index { isFeatured: 1, status: 1 } — this is fast.
 *
 * @param {number} limit  - Maximum number of featured products to return
 * @returns {Array}       - Array of product objects (listing projection)
 */
export const getFeaturedProducts = async (limit = 8) => {
  const products = await Product.find(
    { isFeatured: true, status: "active" },
    {
      name: 1,
      slug: 1,
      thumbnail: 1,
      price: 1,
      salePrice: 1,
      isOnSale: 1,
      averageRating: 1,
      totalReviews: 1,
      brand: 1,
    }
  )
    .limit(limit)
    .lean();

  return products;
};

// ─── Search Products ──────────────────────────────────────────────────────────
/**
 * Full-text search using MongoDB's text index.
 * Returns products matching the search term, sorted by text relevance score.
 *
 * @param {string} searchTerm  - User's search query
 * @param {number} limit       - Max results to return
 * @returns {Array}            - Matching products sorted by relevance
 */
export const searchProducts = async (searchTerm, limit = 20) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    const error = new Error("Search term must be at least 2 characters");
    error.statusCode = 400;
    throw error;
  }

  const products = await Product.find(
    {
      $text: { $search: searchTerm },
      status: "active",
    },
    {
      score: { $meta: "textScore" },
      name: 1,
      slug: 1,
      thumbnail: 1,
      price: 1,
      salePrice: 1,
      isOnSale: 1,
      averageRating: 1,
      brand: 1,
    }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  return products;
};