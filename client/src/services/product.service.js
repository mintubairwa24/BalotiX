/**
 * src/services/product.service.js
 *
 * PURPOSE:
 *   Service layer for all product-related API calls to the NexCart backend.
 *   Each function maps 1-to-1 with a backend endpoint from
 *   PROJECT_CONTEXT.md Part 4 (Product Routes).
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Uses the shared Axios instance (src/api/axios.js) which:
 *   - Sets baseURL to VITE_API_URL (http://localhost:5000/api)
 *   - Sends HttpOnly cookies automatically (withCredentials: true)
 *   - Handles 401 token refresh via interceptors.js
 *
 * WHY FUNCTIONS RETURN THE FULL AXIOS RESPONSE:
 *   Hooks (useProducts.js, useProduct.js) extract response.data.data.*
 *   This keeps the data-shape knowledge in the hook, not in the service.
 *   The service only knows: "what URL to hit and what params to send."
 *
 * SCALABILITY:
 *   All future product mutations (Admin: create, update, delete) are
 *   added here following the same pattern. Service functions are pure —
 *   no React state, no side effects.
 *
 * QUERY PARAMS (from PROJECT_CONTEXT.md Part 4):
 *   getProducts accepts a `filters` object that maps directly to the
 *   backend's supported query params:
 *   page, limit, categoryId, status, brand, minPrice, maxPrice,
 *   inStock, isFeatured, tags, sortBy, sortOrder, search
 */

import api from "../api/axios";
import { PRODUCT_ENDPOINTS } from "../api/endpoints";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Replaces :param placeholders in endpoint strings.
 * buildEndpoint("/products/:id", { id: "abc123" }) → "/products/abc123"
 */
const buildEndpoint = (template, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    template
  );

// ─── Public product queries ───────────────────────────────────────────────────

/**
 * GET /products — paginated product listing with filters.
 *
 * @param {Object} filters — any subset of backend-supported query params:
 *   { page, limit, categoryId, status, brand, minPrice, maxPrice,
 *     inStock, isFeatured, tags, sortBy, sortOrder, search }
 *
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { products, pagination }
 *   pagination → { currentPage, totalPages, totalCount, hasNextPage, hasPrevPage }
 */
export const getProducts = (filters = {}) =>
  api.get(PRODUCT_ENDPOINTS.LIST, { params: filters });

/**
 * GET /products/featured?limit=8 — homepage featured products.
 *
 * @param {number} limit — how many featured products to fetch (default 8)
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { products }
 */
export const getFeaturedProducts = (limit = 8) =>
  api.get(PRODUCT_ENDPOINTS.FEATURED, { params: { limit } });

/**
 * GET /products/search?q=<query> — full-text search.
 *
 * @param {string} query — search term
 * @param {Object} params — additional filters (page, limit, etc.)
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { products, pagination }
 */
export const searchProducts = (query, params = {}) =>
  api.get(PRODUCT_ENDPOINTS.SEARCH, { params: { q: query, ...params } });

/**
 * A small wrapper for the dedicated search page so all search-related UI flows
 * use the same backend-backed helper while remaining future-proof for more
 * advanced discovery features.
 */
export const searchProductsWithFilters = (query, params = {}) =>
  searchProducts(query, params);

/**
 * GET /products/slug/:slug — single product by URL slug (SEO page).
 *
 * @param {string} slug — the product's URL slug (e.g. "iphone-15-pro")
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { product }  (fully populated with categoryId)
 */
export const getProductBySlug = (slug) =>
  api.get(buildEndpoint(PRODUCT_ENDPOINTS.BY_SLUG, { slug }));

/**
 * GET /products/:id — single product by MongoDB ObjectId.
 *
 * @param {string} id — MongoDB ObjectId string
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { product }
 */
export const getProductById = (id) =>
  api.get(buildEndpoint(PRODUCT_ENDPOINTS.BY_ID, { id }));


const PRODUCT_ADMIN_ENDPOINTS = {
  BASE: "/admin/products",
  BY_ID: (id) => `/admin/products/${id}`,
  STATUS: (id) => `/admin/products/${id}/status`,
};
 
/**
 * Create a new product. Expects a FormData instance built by ProductForm.jsx
 * (text fields + zero or more `images` files).
 * @param {FormData} formData
 */
export const createProduct = (formData) => {
  return api.post(PRODUCT_ADMIN_ENDPOINTS.BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
 
/**
 * Update an existing product. Same FormData shape as createProduct — new
 * image files are appended, existing (unchanged) image URLs are sent as
 * plain fields so the backend knows what to keep vs. replace.
 * @param {string} id
 * @param {FormData} formData
 */
export const updateProduct = (id, formData) => {
  return api.patch(PRODUCT_ADMIN_ENDPOINTS.BY_ID(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
 
/**
 * Permanently delete a product.
 * @param {string} id
 */
export const deleteProduct = (id) => {
  return api.delete(PRODUCT_ADMIN_ENDPOINTS.BY_ID(id));
};
 
/**
 * Toggle a product's active/inactive status without touching any other field.
 * @param {string} id
 * @param {boolean} isActive
 */
export const toggleProductStatus = (id, isActive) => {
  return api.patch(PRODUCT_ADMIN_ENDPOINTS.STATUS(id), { status: isActive ? "active" : "inactive" });
};
 
// NOTE: getProducts, getProductById, and any other Phase 5 customer-facing
// read functions already exist above/below this block in your real file —
// this extension only ADDS the four admin functions above; nothing here
// replaces or modifies the existing customer-facing exports.
