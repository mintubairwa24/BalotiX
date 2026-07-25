/**
 * src/services/product.admin.service.js
 *
 * ARCHITECTURAL PURPOSE:
 * This service file is dedicated exclusively to product-related API calls
 * for the admin dashboard. It centralizes all communication with the
 * `/api/admin/products` backend endpoints.
 *
 * This file was created to resolve a series of critical bugs in the admin
 * product management UI:
 * 1.  **404 on Delete:** The client was incorrectly calling `DELETE /api/products/admin/:id`.
 *     This service corrects the path to the proper `DELETE /api/admin/products/:id`.
 * 2.  **Missing Images & Info:** The client was fetching data from the public
 *     `GET /api/products` endpoint, which returns a limited data projection.
 *     This service correctly calls `GET /api/admin/products`, which returns the
 *     full, unfiltered product data required for the admin panel.
 *
 * By separating admin-specific calls from the public-facing product service,
 * we create a clearer, more maintainable, and less error-prone architecture.
 *
 * REUSED/EXTENDED BY:
 * - Admin Product Management components (ProductsTable, ProductForm, etc.)
 * - `useAdminProducts` hook for managing data fetching and mutations.
 */

import api from "../api/axios";

const ADMIN_PRODUCT_ENDPOINTS = {
  // Correct endpoint for fetching the full product list for the admin panel.
  GET_ALL: "/admin/products",
  // Correct endpoint for soft-deleting (archiving) a product.
  ARCHIVE: (id) => `/admin/products/${id}`,
  // Other admin-specific endpoints can be added here.
  GET_BY_ID: (id) => `/admin/products/${id}`,
  UPDATE: (id) => `/admin/products/${id}`,
  UPDATE_STATUS: (id) => `/admin/products/${id}/status`,
};

/**
 * [ADMIN] Fetch a paginated and filterable list of all products.
 * This function hits the correct admin endpoint to get complete product data,
 * including all images, full descriptions, and accurate statuses.
 *
 * @param {object} [params] - Query params for pagination, filtering, sorting.
 *   (e.g., { page: 1, limit: 10, status: 'all', sortBy: 'createdAt' })
 * @returns {Promise} Axios response with products and pagination data.
 */
export const getAdminProducts = (params) => {
  return api.get(ADMIN_PRODUCT_ENDPOINTS.GET_ALL, { params });
};

/**
 * [ADMIN] Archive (soft-delete) a product.
 * This function hits the correct admin endpoint to archive a product,
 * resolving the 404 error.
 *
 * @param {string} productId - The ID of the product to archive.
 * @returns {Promise} Axios response.
 */
export const archiveAdminProduct = (productId) => {
  return api.delete(ADMIN_PRODUCT_ENDPOINTS.ARCHIVE(productId));
};