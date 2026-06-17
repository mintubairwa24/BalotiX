/**
 * category.model.js
 *
 * WHO CALLS IT:
 *   category.service.js imports this model to perform all DB operations.
 *   The Product module references this model indirectly via
 *   `ref: "Category"` in product.model.js — the model name below MUST
 *   stay exactly "Category" or every existing .populate("categoryId", ...)
 *   call in product.service.js breaks silently at runtime.
 *
 * WHY IT EXISTS:
 *   Defines the shape of a Category document. Implements the Materialized
 *   Path pattern (an "ancestors" array) so that finding every descendant of
 *   a category — e.g. every product under "Electronics" including products
 *   nested 3 levels deep — is a single indexed query instead of a recursive
 *   walk of the tree.
 *
 * INPUT:   Raw JS object passed to `new Category({...})` or `Category.create({...})`
 * OUTPUT:  Mongoose Document instance with schema methods and virtuals attached
 */

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name must not exceed 100 characters"],
    },

    slug: {
      // Auto-generated from name in the pre-save hook below.
      // Used in URLs: /category/electronics or /category/mobile-phones
      // CONTRACT: product.service.js calls .populate("categoryId", "name slug")
      // on the Product model. This field name must stay "slug" exactly.
      // Uniqueness is enforced by the explicit schema.index() call below,
      // not here — see the matching fix in product.model.js for why.
      type: String,
      lowercase: true,
      trim: true,
    },

    description: {
      // Optional. Used on category landing pages and for SEO meta description.
      type: String,
      trim: true,
      maxlength: [1000, "Description must not exceed 1000 characters"],
      default: "",
    },

    image: {
      // Banner image URL shown at the top of the category landing page.
      // Stored as a URL only — actual file lives in an object store (S3/Cloudinary),
      // same pattern as Product's image handling.
      type: String,
      default: "",
    },

    // ── Hierarchy (Materialized Path Pattern) ────────────────────────────────
    parentId: {
      // Direct parent category. Null means this is a root category
      // (e.g. "Electronics" has parentId: null).
      // Self-referencing ref — populate("parentId") returns the parent Category.
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    ancestors: {
      // THE CORE SCALABILITY DECISION OF THIS SCHEMA.
      // Stores every ancestor ID from root down to (but not including) this
      // category's direct parent. Example: "Android Phones" under
      // "Mobile Phones" under "Electronics" stores:
      //   ancestors: [electronicsId, mobilePhonesId]
      //
      // WHY: without this, finding "every product under Electronics" requires
      // walking the tree level by level (N queries for N levels deep).
      // WITH this array, it becomes one query:
      //   Category.find({ ancestors: electronicsId })
      // This is a multikey array — see the index declared below.
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      default: [],
    },

    level: {
      // Depth in the tree. Root categories are level 0.
      // Computed automatically in the pre-save hook from parentId's level + 1.
      // Used to limit UI nesting depth and for breadcrumb rendering order.
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Display & Ordering ────────────────────────────────────────────────────
    displayOrder: {
      // Controls the order categories appear in navbars/menus among siblings.
      // Lower numbers display first. Two categories can share a value;
      // ties are broken by name alphabetically at query time.
      type: Number,
      default: 0,
    },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      // active:   visible in navigation, can be assigned to new products
      // inactive: hidden from storefront navigation, but existing product
      //           references remain valid (no cascading break)
      // archived: soft-deleted. Terminal state — see service-layer guard
      //           that blocks this transition while productCount > 0.
      type: String,
      enum: {
        values: ["active", "inactive", "archived"],
        message: "{VALUE} is not a valid category status",
      },
      default: "active",
    },

    // ── Denormalised Cache ────────────────────────────────────────────────────
    productCount: {
      // Cached count of products currently assigned to this exact category
      // (leaf-level count, not including descendant categories).
      // NOT the source of truth — Product collection is the source of truth.
      // Kept in sync by the Inventory/Product write paths (future integration
      // point) and used here purely as a fast-read guard before archiving:
      // a category with productCount > 0 cannot be archived.
      type: Number,
      default: 0,
      min: 0,
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

// isRoot: convenience flag for frontend tree rendering
categorySchema.virtual("isRoot").get(function () {
  return this.parentId === null;
});

// isLeaf is NOT computed here — whether a category has children requires
// a query against other Category documents, which a virtual cannot do
// synchronously. The service layer computes this when building tree responses.

// ─── Indexes ──────────────────────────────────────────────────────────────────

// slug: unique, hit on every category page load (/category/:slug)
categorySchema.index({ slug: 1 }, { unique: true });

// parentId + status + displayOrder: covers "get ordered active children of node X"
// This is the query that renders every dropdown/submenu in the navbar.
categorySchema.index({ parentId: 1, status: 1, displayOrder: 1 });

// ancestors: multikey index — MongoDB automatically creates a multikey index
// when indexing an array field. This is what makes
// Category.find({ ancestors: electronicsId }) fast regardless of tree depth.
categorySchema.index({ ancestors: 1 });

// level + status: for admin dashboards that list categories grouped by depth
categorySchema.index({ level: 1, status: 1 });

// ─── Pre-Save Hook: Slug Generation ──────────────────────────────────────────
// Identical pattern to product.model.js — generates a unique URL-safe slug
// from the name, auto-incrementing on collision (electronics, electronics-2).
categorySchema.pre("save", async function (next) {
  if (!this.isModified("name")) return next();

  const baseSlug = this.name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await mongoose
      .model("Category")
      .findOne({ slug, _id: { $ne: this._id } });
    if (!existing) break;
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;
  next();
});

// ─── Pre-Save Hook: Compute ancestors and level from parentId ────────────────
// Runs whenever parentId changes (on create, or if an admin re-parents a
// category). Builds the materialized path by reading the parent's own
// ancestors array and appending the parent's _id.
//
// NOTE: this hook handles the CURRENT document only. If parentId changes on
// an EXISTING category that already has children, those children's stored
// ancestors/level become stale and must be cascaded — this is handled
// explicitly in category.service.js's updateCategory function, not here,
// because cascading is a multi-document operation outside a single document's
// pre-save hook.
categorySchema.pre("save", async function (next) {
  if (!this.isModified("parentId")) return next();

  if (this.parentId === null) {
    this.ancestors = [];
    this.level = 0;
    return next();
  }

  const parent = await mongoose.model("Category").findById(this.parentId);

  if (!parent) {
    const error = new Error("Parent category not found");
    error.statusCode = 404;
    return next(error);
  }

  // Prevent a category from becoming its own ancestor (would create a cycle)
  if (parent._id.equals(this._id)) {
    const error = new Error("A category cannot be its own parent");
    error.statusCode = 400;
    return next(error);
  }

  this.ancestors = [...parent.ancestors, parent._id];
  this.level = parent.level + 1;
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;