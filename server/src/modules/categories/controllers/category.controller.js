/**
 * category.controller.js
 *
 * WHO CALLS IT:
 *   category.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same contract as product.controller.js: extract from req, call service,
 *   send response. Zero business logic. Zero DB calls. Every method is
 *   wrapped in try/catch, passing errors to next(error) for the global
 *   error handler to format.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as categoryService from "../services/category.service.js";

// ─── Create Category ──────────────────────────────────────────────────────────
/**
 * POST /api/categories
 * Admin only.
 */
export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(
      req.body,
      req.user._id
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Categories ───────────────────────────────────────────────────────
/**
 * GET /api/categories
 * Public. Returns flat array or nested tree depending on ?flat= query param.
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const result = await categoryService.getAllCategories(req.query);

    // When flat=true with pagination, result is { categories, pagination }
    // When flat=false, result is a nested tree array
    if (result && typeof result === 'object' && result.categories) {
      res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      res.status(200).json({
        success: true,
        data: { categories: result },
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─── Get Category By ID ───────────────────────────────────────────────────────
/**
 * GET /api/categories/:id
 * Public.
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Category By Slug ─────────────────────────────────────────────────────
/**
 * GET /api/categories/slug/:slug
 * Public. Admins can pass ?adminView=true to bypass the active-only filter.
 */
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const adminView = isAdmin && req.query.adminView === "true";

    const category = await categoryService.getCategoryBySlug(
      req.params.slug,
      adminView
    );

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Category ──────────────────────────────────────────────────────────
/**
 * PUT /api/categories/:id
 * Admin only.
 */
export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Category Status ───────────────────────────────────────────────────
/**
 * PATCH /api/categories/:id/status
 * Admin only.
 */
export const updateCategoryStatus = async (req, res, next) => {
  try {
    const result = await categoryService.updateCategoryStatus(
      req.params.id,
      req.body.status,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Category status updated to "${result.status}"`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Archive Category ─────────────────────────────────────────────────────────
/**
 * DELETE /api/categories/:id
 * Admin only. SOFT DELETE — blocked if products or active children exist.
 */
export const archiveCategory = async (req, res, next) => {
  try {
    const result = await categoryService.archiveCategory(
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

// ─── Get Breadcrumb Path ──────────────────────────────────────────────────────
/**
 * GET /api/categories/:id/breadcrumb
 * Public. Returns root-to-leaf array for breadcrumb UI rendering.
 */
export const getBreadcrumbPath = async (req, res, next) => {
  try {
    const breadcrumb = await categoryService.getBreadcrumbPath(req.params.id);

    res.status(200).json({
      success: true,
      data: { breadcrumb },
    });
  } catch (error) {
    next(error);
  }
};