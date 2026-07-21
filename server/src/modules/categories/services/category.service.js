/**
 * category.service.js
 *
 * WHO CALLS IT:
 *   category.controller.js — the controller delegates ALL business logic here.
 *
 * WHY IT EXISTS:
 *   Brain of the Category Module. Owns tree-building logic, cascading
 *   ancestor/level updates on re-parenting, and the archive guard that
 *   prevents orphaning live products. Mirrors product.service.js's pattern
 *   exactly: every method returns data or throws a descriptive Error with
 *   a statusCode attached, never a { success: false } object.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects (Mongoose documents converted to JSON) or thrown errors
 *
 * CROSS-MODULE NOTE:
 *   This file imports the Product model READ-ONLY, solely to count products
 *   in a category before allowing an archive. It never writes to Product.
 *   This avoids circular logic — Product never imports Category's service,
 *   only Category's model name via `ref: "Category"` in its schema, which
 *   is a string reference resolved by Mongoose at query time, not an import.
 */

import mongoose from "mongoose";
import Category from "../models/category.model.js";
import Product from "../../products/models/product.model.js";

// ─── Create Category ──────────────────────────────────────────────────────────
/**
 * Creates a new category document.
 *
 * FLOW:
 *   1. If parentId is provided, verify the parent exists (clearer error than
 *      letting the pre-save hook discover this — same pre-check pattern as
 *      product.service.js's SKU uniqueness check)
 *   2. Build and save — pre-save hooks generate slug, ancestors, and level
 *
 * @param {Object} categoryData  - Validated category fields from Zod schema
 * @param {string} adminId       - The _id of the authenticated admin user
 * @returns {Object}             - The newly created category document
 */
export const createCategory = async (categoryData, adminId) => {
  if (categoryData.parentId) {
    const parentExists = await Category.findById(categoryData.parentId);
    if (!parentExists) {
      const error = new Error("Parent category not found");
      error.statusCode = 404;
      throw error;
    }
    if (parentExists.status === "archived") {
      const error = new Error("Cannot create a category under an archived parent");
      error.statusCode = 400;
      throw error;
    }
  }

  const category = new Category({
    ...categoryData,
    createdBy: adminId,
    updatedBy: adminId,
  });

  // .save() triggers pre-save hooks: slug generation + ancestors/level computation
  await category.save();

  return category.toJSON();
};

// ─── Get All Categories ───────────────────────────────────────────────────────
/**
 * Returns categories either as a flat array or as a server-assembled tree.
 *
 * TREE ASSEMBLY ALGORITHM:
 *   1. Fetch all matching categories in one query (no recursion, no N+1)
 *   2. Build a Map keyed by _id for O(1) lookup
 *   3. Walk the flat list once, attaching each node to its parent's
 *      `children` array — or to the root list if parentId is null
 *   This is O(n) total, not O(n^2), regardless of tree depth.
 *
 * @param {Object} query - Validated query params from categoryQuerySchema
 * @returns {Array}      - Flat array OR nested tree array, depending on query.flat
 */
export const getAllCategories = async (query) => {
  const { flat, status, parentId, ancestorOf, search, page, limit, sortBy, sortOrder } = query;

  const filter = {};
  if (status) filter.status = status;
  if (parentId !== undefined) filter.parentId = parentId;
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // ancestorOf uses the multikey "ancestors" index — this is the query that
  // makes "show everything under Electronics" a single fast lookup instead
  // of a recursive tree walk.
  if (ancestorOf) {
    filter.ancestors = new mongoose.Types.ObjectId(ancestorOf);
  }

  // Build sort object
  let sortObj = { displayOrder: 1, name: 1 };
  if (sortBy) {
    const order = sortOrder === "asc" ? 1 : -1;
    sortObj = { [sortBy]: order };
  }

  // Pagination support
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 0;
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination
  const totalCount = await Category.countDocuments(filter);

  // Aggregation pipeline to get categories with their active product counts
  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "products",
        let: { categoryId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$categoryId", "$$categoryId"] },
              status: "active", // Only count visible products for the storefront
            },
          },
          { $count: "count" },
        ],
        as: "productInfo",
      },
    },
    {
      $addFields: {
        // Overwrite the potentially stale productCount from the model with a live count
        productCount: { $ifNull: [{ $first: "$productInfo.count" }, 0] },
      },
    },
    { $project: { productInfo: 0 } }, // Clean up the temporary lookup result
    { $sort: sortObj },
  ];

  if (skip > 0) pipeline.push({ $skip: skip });
  if (limitNum > 0) pipeline.push({ $limit: limitNum });

  const categories = await Category.aggregate(pipeline);

  if (flat) {
    return {
      categories,
      pagination: limitNum > 0 ? {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
        hasPrevPage: pageNum > 1,
      } : undefined,
    };
  }

  // ── Tree assembly ──────────────────────────────────────────────────────
  const categoryMap = new Map();
  const rootCategories = [];

  // First pass: index every category by its _id and initialise children array
  categories.forEach((cat) => {
    cat.children = [];
    categoryMap.set(cat._id.toString(), cat);
  });

  // Second pass: attach each category to its parent's children array
  categories.forEach((cat) => {
    if (cat.parentId === null || cat.parentId === undefined) {
      rootCategories.push(cat);
    } else {
      const parent = categoryMap.get(cat.parentId.toString());
      if (parent) {
        parent.children.push(cat);
      } else {
        // Parent not in this filtered result set (e.g. filtered by status) —
        // treat as a root for this response rather than silently dropping it.
        rootCategories.push(cat);
      }
    }
  });

  return rootCategories;
};

// ─── Get Category By ID ───────────────────────────────────────────────────────
/**
 * Fetches a single category by its MongoDB _id, with parent populated.
 *
 * @param {string} categoryId  - MongoDB ObjectId string
 * @returns {Object}           - Full category document
 */
export const getCategoryById = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const error = new Error("Invalid category ID format");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(categoryId)
    .populate("parentId", "name slug")
    .lean({ virtuals: true });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
};

// ─── Get Category By Slug ─────────────────────────────────────────────────────
/**
 * Fetches a single category by its URL slug.
 * Mirrors product.service.js's getProductBySlug pattern exactly.
 *
 * @param {string} slug       - URL slug (e.g. "mobile-phones")
 * @param {boolean} adminView - If true, bypass the status=active filter
 * @returns {Object}          - Full category document
 */
export const getCategoryBySlug = async (slug, adminView = false) => {
  const filter = { slug };

  if (!adminView) {
    filter.status = "active";
  }

  const category = await Category.findOne(filter)
    .populate("parentId", "name slug")
    .lean({ virtuals: true });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
};

// ─── Update Category ──────────────────────────────────────────────────────────
/**
 * Partially updates a category document.
 *
 * THE CASCADING RE-PARENT PROBLEM:
 *   If parentId changes, this category's own ancestors/level get recomputed
 *   automatically by the pre-save hook in category.model.js. BUT any
 *   descendant categories already in the database have ancestors arrays that
 *   were computed against the OLD parent chain — those are now stale.
 *
 *   Example: "Android Phones" (ancestors: [Electronics, MobilePhones]) is
 *   re-parented from "Mobile Phones" to "Tablets". Its own ancestors gets
 *   recomputed to [Electronics, Tablets]. But if "Android Phones" had a
 *   child "Budget Android Phones", that child's ancestors still says
 *   [Electronics, MobilePhones, AndroidPhones] — wrong, because the path
 *   to AndroidPhones itself just changed.
 *
 *   FIX: after saving this category, find every descendant
 *   (Category.find({ ancestors: this._id })) and recompute each one's
 *   ancestors/level from scratch, then bulk-save. This is the one
 *   multi-document write in this entire module.
 *
 * WHY findById + save (not findByIdAndUpdate)?
 *   Same reasoning as product.service.js — findByIdAndUpdate bypasses
 *   Mongoose pre-save hooks. The slug regeneration and ancestors/level
 *   computation hooks must run.
 *
 * @param {string} categoryId   - MongoDB ObjectId string
 * @param {Object} updateData   - Partial category fields (validated by Zod)
 * @param {string} adminId      - The _id of the authenticated admin user
 * @returns {Object}            - Updated category document
 */
export const updateCategory = async (categoryId, updateData, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const error = new Error("Invalid category ID format");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (category.status === "archived") {
    const error = new Error("Archived categories cannot be updated");
    error.statusCode = 400;
    throw error;
  }

  // Guard against a category being re-parented under one of its own
  // descendants — this would create a cycle in the tree.
  if (
    updateData.parentId &&
    updateData.parentId !== String(category.parentId)
  ) {
    const newParentId = new mongoose.Types.ObjectId(updateData.parentId);

    if (newParentId.equals(category._id)) {
      const error = new Error("A category cannot be its own parent");
      error.statusCode = 400;
      throw error;
    }

    const wouldCreateCycle = await Category.findOne({
      _id: newParentId,
      ancestors: category._id,
    });
    if (wouldCreateCycle) {
      const error = new Error(
        "Cannot move a category under its own descendant"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  const isReparenting =
    updateData.parentId !== undefined &&
    String(updateData.parentId) !== String(category.parentId);

  Object.assign(category, updateData);
  category.updatedBy = adminId;

  // .save() triggers pre-save hooks (slug regen if name changed,
  // ancestors/level recompute if parentId changed)
  await category.save();

  // ── Cascade to descendants if re-parenting occurred ──────────────────────
  if (isReparenting) {
    await cascadeAncestorUpdate(category);
  }

  return category.toJSON();
};

// ─── Internal Helper: Cascade ancestor/level updates to descendants ─────────
/**
 * Not exported — only used internally by updateCategory.
 * Recomputes ancestors and level for every descendant of the given category,
 * since their stored paths reference the OLD position in the tree.
 *
 * Uses a breadth-first walk: fix direct children first (their new ancestors
 * is simple to compute from the parent we just saved), then recurse one
 * level at a time so each level's corrected ancestors feeds the next.
 *
 * @param {Document} updatedCategory - The category that was just re-parented
 *
 * PERFORMANCE NOTE:
 *   This uses a non-recursive, breadth-first update strategy to avoid
 *   performance issues on deep or wide category trees. It fetches all
 *   descendants once, then builds a single `bulkWrite` operation to update
 *   them all in one database round-trip, which is significantly more
 *   efficient than recursive `save()` calls.
 */
const cascadeAncestorUpdate = async (updatedCategory) => {
  // 1. A single query to get all descendants of the category that was moved.
  const descendants = await Category.find({ ancestors: updatedCategory._id });

  if (descendants.length === 0) {
    return; // No descendants to update.
  }

  const bulkOps = [];
  // 2. Use a queue for a Breadth-First traversal, which processes level by level.
  // Start with the plain object of the moved category.
  const queue = [updatedCategory.toObject()];

  while (queue.length > 0) {
    const parent = queue.shift();
    // 3. Find direct children of the current parent *from the initial descendant list*.
    // This avoids hitting the database again inside the loop.
    const children = descendants.filter(d => String(d.parentId) === String(parent._id));

    for (const child of children) {
      const newAncestors = [...parent.ancestors, parent._id];
      const newLevel = parent.level + 1;

      bulkOps.push({
        updateOne: {
          filter: { _id: child._id },
          update: { $set: { ancestors: newAncestors, level: newLevel } },
        },
      });

      // 4. Add the updated child's info to the queue for its own children to be processed.
      queue.push({ ...child.toObject(), ancestors: newAncestors, level: newLevel });
    }
  }

  if (bulkOps.length > 0) {
    await Category.bulkWrite(bulkOps);
  }
};
// ─── Update Category Status ───────────────────────────────────────────────────
/**
 * Changes a category's status. Mirrors product.service.js's
 * updateProductStatus exactly, with one extra rule: archiving is blocked
 * while productCount > 0.
 *
 * @param {string} categoryId  - MongoDB ObjectId string
 * @param {string} newStatus   - One of "active" | "inactive" | "archived"
 * @param {string} adminId     - The requesting admin's _id
 * @returns {Object}           - { _id, status, updatedAt }
 */
export const updateCategoryStatus = async (categoryId, newStatus, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const error = new Error("Invalid category ID format");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (newStatus === "archived") {
    await assertCanArchive(category);
  }

  category.status = newStatus;
  category.updatedBy = adminId;
  await category.save();

  return {
    _id: category._id,
    status: category.status,
    updatedAt: category.updatedAt,
  };
};

// ─── Archive Category (Soft Delete) ──────────────────────────────────────────
/**
 * Archives a category — the only form of deletion in this module.
 * Blocked if the category still has products assigned, or still has
 * non-archived children. Admin must reassign/archive those first.
 *
 * @param {string} categoryId  - MongoDB ObjectId string
 * @param {string} adminId     - The requesting admin's _id
 * @returns {Object}           - Confirmation message
 */
export const archiveCategory = async (categoryId, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const error = new Error("Invalid category ID format");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (category.status === "archived") {
    const error = new Error("Category is already archived");
    error.statusCode = 400;
    throw error;
  }

  await assertCanArchive(category);

  category.status = "archived";
  category.updatedBy = adminId;
  await category.save();

  return {
    _id: category._id,
    message: "Category archived successfully",
  };
};

// ─── Internal Helper: Guard against archiving a category in active use ──────
/**
 * Not exported — shared guard used by both archiveCategory and
 * updateCategoryStatus (when transitioning to "archived").
 *
 * Checks two conditions, either of which blocks the archive:
 *   1. Live products are still assigned to this exact category
 *   2. Non-archived child categories still exist under this one
 *
 * @param {Document} category - The category being archived
 */
const assertCanArchive = async (category) => {
  const liveProductCount = await Product.countDocuments({
    categoryId: category._id,
    status: { $ne: "archived" },
  });

  if (liveProductCount > 0) {
    const error = new Error(
      `Cannot archive: ${liveProductCount} active product(s) are still assigned to this category`
    );
    error.statusCode = 409;
    throw error;
  }

  const activeChildCount = await Category.countDocuments({
    parentId: category._id,
    status: { $ne: "archived" },
  });

  if (activeChildCount > 0) {
    const error = new Error(
      `Cannot archive: ${activeChildCount} active subcategory/subcategories still exist under this category`
    );
    error.statusCode = 409;
    throw error;
  }
};

// ─── Get Breadcrumb Path ──────────────────────────────────────────────────────
/**
 * Returns the full ancestor chain plus the category itself, in root-to-leaf
 * order, ready for breadcrumb rendering: "Electronics > Mobile Phones > Android Phones"
 *
 * Uses the stored "ancestors" array directly — no recursive queries needed,
 * just one $in lookup against the IDs already stored on the document.
 *
 * @param {string} categoryId  - MongoDB ObjectId string (the leaf category)
 * @returns {Array}            - [{ _id, name, slug }, ...] root to leaf
 */
export const getBreadcrumbPath = async (categoryId) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    const error = new Error("Invalid category ID format");
    error.statusCode = 400;
    throw error;
  }

  const category = await Category.findById(categoryId, "name slug ancestors");

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (category.ancestors.length === 0) {
    return [{ _id: category._id, name: category.name, slug: category.slug }];
  }

  const ancestorDocs = await Category.find(
    { _id: { $in: category.ancestors } },
    "name slug"
  ).lean();

  // $in does not guarantee order — re-sort to match the stored ancestors
  // array order (root to direct parent) before appending the leaf.
  const ancestorMap = new Map(
    ancestorDocs.map((doc) => [doc._id.toString(), doc])
  );
  const orderedAncestors = category.ancestors.map((id) =>
    ancestorMap.get(id.toString())
  );

  return [
    ...orderedAncestors,
    { _id: category._id, name: category.name, slug: category.slug },
  ];
};