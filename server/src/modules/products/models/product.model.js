/**
 * product.model.js
 *
 * WHO CALLS IT:
 *   Product service imports this model to perform all DB operations.
 *   No other layer (controller, route) ever touches the model directly.
 *
 * WHY IT EXISTS:
 *   Defines the shape of a Product document in MongoDB, enforces schema-level
 *   constraints, declares indexes for query performance, and provides a
 *   pre-save hook that auto-generates a unique URL slug from the product name.
 *
 * INPUT:   Raw JS object passed to `new Product({...})` or `Product.create({...})`
 * OUTPUT:  Mongoose Document instance with all schema methods and virtuals attached
 */

import mongoose from "mongoose";

// ─── Image Sub-Schema ────────────────────────────────────────────────────────
// Each product can have multiple images. We embed them as an array of
// sub-documents rather than a separate collection because images have no
// independent identity — they only make sense in the context of their product.
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
      default: "",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ─── Product Schema ───────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [200, "Product name must not exceed 200 characters"],
    },

    slug: {
      // Auto-generated from name in the pre-save hook below.
      // Used in SEO-friendly URLs: /products/apple-iphone-15-pro
      // Unique index ensures no two products share a URL.
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [5000, "Description must not exceed 5000 characters"],
    },

    sku: {
      // Stock Keeping Unit — a human-readable unique product identifier.
      // Used by warehouse staff and in order line items.
      // Immutable after creation (enforced in service layer).
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    // ── Pricing ───────────────────────────────────────────────────────────────
    price: {
      // Base price in smallest currency unit (paise for INR, cents for USD).
      // Storing as Number avoids floating-point issues when doing arithmetic.
      // Business rule: salePrice must always be < price (validated in Zod).
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    salePrice: {
      // Optional discounted price. Null means no active sale.
      // The service layer exposes a computed "effectivePrice" virtual.
      type: Number,
      default: null,
      min: [0, "Sale price cannot be negative"],
    },

    currency: {
      type: String,
      default: "INR",
      enum: ["INR", "USD", "EUR", "GBP"],
    },

    isOnSale: {
      // Denormalised flag so listing queries can filter { isOnSale: true }
      // without computing salePrice < price in every query.
      type: Boolean,
      default: false,
    },

    // ── Media ─────────────────────────────────────────────────────────────────
    images: {
      type: [imageSchema],
      default: [],
    },

    thumbnail: {
      // Denormalised URL of the primary image for fast list rendering.
      // Kept in sync with images array by the pre-save hook below.
      type: String,
      default: "",
    },

    // ── Classification ────────────────────────────────────────────────────────
    categoryId: {
      // Soft reference to the Category collection.
      // We use ObjectId + ref for populate() in queries that need category data.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    tags: {
      // Free-form tags for search and filtering (e.g. ["wireless", "gaming"]).
      type: [String],
      default: [],
    },

    attributes: {
      // Flexible key-value map for category-specific specs.
      // A shirt: { size: "L", color: "black" }
      // A laptop: { ram: "16GB", processor: "M3" }
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    weight: {
      // In grams. Used for shipping cost calculation.
      type: Number,
      default: 0,
      min: 0,
    },

    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },

    // ── Inventory Hint ────────────────────────────────────────────────────────
    // IMPORTANT: This is a denormalised CACHE, not the source of truth.
    // The Inventory module owns stock. This field exists so product listing
    // queries do not need to join the inventory collection on every request.
    // The Inventory service is responsible for keeping this in sync.
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    trackInventory: {
      type: Boolean,
      default: true,
    },

    allowBackorder: {
      type: Boolean,
      default: false,
    },

    // ── Status & Visibility ───────────────────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ["draft", "active", "inactive", "out_of_stock", "archived"],
        message: "{VALUE} is not a valid product status",
      },
      default: "draft",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // ── Ratings Summary (Denormalised) ────────────────────────────────────────
    // The Review module updates these fields on every review write.
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    ratingBreakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },

    // ── Audit Trail ───────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
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
// Computed properties NOT stored in MongoDB — calculated on access.

productSchema.virtual("effectivePrice").get(function () {
  if (this.isOnSale && this.salePrice !== null) return this.salePrice;
  return this.price;
});

productSchema.virtual("discountPercentage").get(function () {
  if (!this.isOnSale || this.salePrice === null || this.price === 0) return 0;
  return Math.round(((this.price - this.salePrice) / this.price) * 100);
});

productSchema.virtual("isLowStock").get(function () {
  return (
    this.trackInventory &&
    this.stockQuantity > 0 &&
    this.stockQuantity <= this.lowStockThreshold
  );
});

productSchema.virtual("isInStock").get(function () {
  if (!this.trackInventory) return true;
  return this.stockQuantity > 0 || this.allowBackorder;
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// slug: unique, every product page load hits this
// productSchema.index({ slug: 1 }, { unique: true });

// Covers the most common listing query: active products in a category sorted by price
productSchema.index({ status: 1, categoryId: 1, price: 1 });

// Full-text search across name, description, and tags
productSchema.index({ name: "text", description: "text", tags: "text" });

// Homepage featured products query
productSchema.index({ isFeatured: 1, status: 1 });

// Admin dashboard: sort by newest
productSchema.index({ createdAt: -1 });

// Brand-filtered listing pages
productSchema.index({ brand: 1, status: 1 });

// ─── Pre-Save: Slug Generation ────────────────────────────────────────────────
productSchema.pre("save", async function () {
  if (!this.isModified("name")) return;

  const baseSlug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let count = 1;

  // Loop until we find a slug that does not already exist in the DB
  while (true) {
    const existing = await mongoose
      .model("Product")
      .findOne({ slug, _id: { $ne: this._id } });
    if (!existing) break;
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;
});

// ─── Pre-Save: Sync Derived Fields ───────────────────────────────────────────
productSchema.pre("save", async function () {
  // Keep isOnSale flag consistent with salePrice
  this.isOnSale = this.salePrice !== null && this.salePrice < this.price;

  // Keep thumbnail in sync with the primary image
  const primaryImage = this.images.find((img) => img.isPrimary);
  if (primaryImage) {
    this.thumbnail = primaryImage.url;
  } else if (this.images.length > 0) {
    this.thumbnail = this.images[0].url;
  }

});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
