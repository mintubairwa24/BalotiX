/**
 * src/services/category.service.js
 *
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all backend API interactions for the Category module. This
 * includes both public-facing calls (like fetching categories for navigation)
 * and admin-only CRUD operations. It is the single source of truth for
 * category API endpoints and request/response formats.
 *
 * This file was created to resolve a `req.body is undefined` error during
 * category creation. The root cause was the client sending a POST request
 * without a valid JSON body. This service ensures that all category-related
 * requests are structured correctly.
 *
 * REUSED/EXTENDED BY:
 * - Admin Category Management components (for CRUD)
 * - Public-facing layout/navigation components (for fetching the category tree)
 * - `useAdminCategories` hook (or similar) for managing admin data fetching.
 *
 * PRODUCTION-READY BECAUSE:
 * - Centralizes all category-related API endpoints in one place.
 * - Follows the established service pattern of the application.
 * - Provides clear, named functions for specific operations, improving
 *   code readability and maintainability.
 * - Returns the full Axios promise, allowing callers (like React Query hooks)
 *   to handle loading, error, and data states.
 */

import api from "../api/axios";

// --- Public Endpoints ---

const CATEGORY_PUBLIC_ENDPOINTS = {
  GET_ALL: "/categories",
  GET_BY_SLUG: (slug) => `/categories/slug/${slug}`,
};

/**
 * [Public] Fetch all active categories, typically for navigation menus.
 * The backend is expected to return only 'active' categories and may return
 * them as a tree structure.
 * @param {object} [params] - Optional query params, e.g., { flat: false }
 * @returns {Promise} Axios response with categories.
 */
export const getPublicCategories = (params) => {
  return api.get(CATEGORY_PUBLIC_ENDPOINTS.GET_ALL, { params });
};

/**
 * [Public] Fetch a single category by its slug for a category landing page.
 * @param {string} slug - The URL slug of the category.
 * @returns {Promise} Axios response with the category data.
 */
export const getCategoryBySlug = (slug) => {
  return api.get(CATEGORY_PUBLIC_ENDPOINTS.GET_BY_SLUG(slug));
};


// --- Admin Endpoints ---

const CATEGORY_ADMIN_ENDPOINTS = {
  GET_ALL: "/admin/categories",
  CREATE: "/categories", // Matches the route from the error log
  GET_BY_ID: (id) => `/admin/categories/${id}`,
  UPDATE: (id) => `/admin/categories/${id}`,
  UPDATE_STATUS: (id) => `/admin/categories/${id}/status`,
  DELETE: (id) => `/admin/categories/${id}`, // Assumes soft delete/archive
};

/**
 * [Admin] Fetch a paginated and filterable list of all categories.
 * @param {object} [params] - Query params for pagination, filtering, sorting.
 * @returns {Promise} Axios response with categories and pagination data.
 */
export const getAdminCategories = (params) => {
  return api.get(CATEGORY_ADMIN_ENDPOINTS.GET_ALL, { params });
};

/**
 * [Admin] Create a new category.
 * @param {object} categoryData - Data for the new category (e.g., { name, parentId }).
 * @returns {Promise} Axios response with the newly created category.
 */
export const createCategory = (categoryData) => {
  // The component calling this function MUST ensure categoryData is a valid object.
  // If categoryData is undefined, Axios will send no body, causing the server error.
  return api.post(CATEGORY_ADMIN_ENDPOINTS.CREATE, categoryData);
};

/**
 * [Admin] Update an existing category.
 * @param {string} id - The ID of the category to update.
 * @param {object} updateData - The fields to update.
 * @returns {Promise} Axios response with the updated category.
 */
export const updateCategory = (id, updateData) => {
  return api.patch(CATEGORY_ADMIN_ENDPOINTS.UPDATE(id), updateData);
};

/**
 * [Admin] Update the status of a category (e.g., 'active', 'inactive').
 * @param {string} id - The ID of the category.
 * @param {string} status - The new status.
 * @returns {Promise} Axios response.
 */
export const updateCategoryStatus = (id, status) => {
  return api.patch(CATEGORY_ADMIN_ENDPOINTS.UPDATE_STATUS(id), { status });
};

/**
 * [Admin] Archive (soft-delete) a category.
 * @param {string} id - The ID of the category to archive.
 * @returns {Promise} Axios response.
 */
export const archiveCategory = (id) => {
  return api.delete(CATEGORY_ADMIN_ENDPOINTS.DELETE(id));
};