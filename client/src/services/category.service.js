/**
 * src/services/category.service.js
 *
 * PURPOSE:
 *   Service layer for all category-related API calls to the NexCart backend.
 *   Each function maps 1-to-1 with a backend endpoint from
 *   PROJECT_CONTEXT.md Part 4 (Category Routes).
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Uses the shared Axios instance (src/api/axios.js) which:
 *   - Sets baseURL to VITE_API_URL (http://localhost:5000/api)
 *   - Sends HttpOnly cookies automatically (withCredentials: true)
 *   - Handles 401 token refresh via interceptors.js
 *
 * BACKEND CATEGORY OBJECT SHAPE:
 *   {
 *     _id, name, slug, description, image,
 *     parentId,       → null for root categories
 *     ancestors,      → [id, id, ...] from root to parent
 *     level,          → 0 = root, 1 = child, 2 = grandchild
 *     displayOrder,
 *     status,         → "active" | "inactive"
 *     productCount,   → cached count of products in this category
 *     children,       → [] when flat=false (nested tree from backend)
 *   }
 *
 * WHY flat=false IS THE DEFAULT FOR NAVIGATION:
 *   The backend assembles the full nested tree when flat=false.
 *   The CategorySidebar needs the tree to render expandable sub-menus.
 *   Flat array (flat=true) is used for CategoryGrid which just needs
 *   a simple list without hierarchy.
 *
 * SCALABILITY:
 *   All future category mutations (Admin: create, update, delete, reorder)
 *   are added here. Service functions are pure — no React state, no side effects.
 *
 * REUSE:
 *   useCategories.js     → getCategories (all active categories)
 *   useCategory.js       → getCategoryBySlug (detail + breadcrumb)
 *   CategorySidebar      → uses tree structure from getCategories(flat=false)
 *   CategoryGrid         → uses flat list from getCategories(flat=true)
 *   Header MegaMenu (future) → getCategories(flat=false, limit root)
 */

import api from "../api/axios";
import { CATEGORY_ENDPOINTS } from "../api/endpoints";

// ─── Shared helper ────────────────────────────────────────────────────────────
const buildEndpoint = (template, params = {}) =>
  Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    template
  );

// ─── Public category queries ──────────────────────────────────────────────────

/**
 * GET /categories — all active categories.
 *
 * @param {Object} params
 *   flat: true  → flat array (frontend builds tree if needed)
 *   flat: false → server-assembled nested tree (default)
 *   status: "active" — always active for customer-facing pages
 *
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { categories }
 */
export const getCategories = (params = { flat: false, status: "active" }) =>
  api.get(CATEGORY_ENDPOINTS.LIST, { params });

/**
 * GET /categories/slug/:slug — single category by URL slug.
 * Used by CategoryPage for the page's title, description, and image.
 *
 * @param {string} slug — the category's URL slug (e.g. "mobile-phones")
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { category }
 */
export const getCategoryBySlug = (slug) =>
  api.get(buildEndpoint(CATEGORY_ENDPOINTS.BY_SLUG, { slug }));

/**
 * GET /categories/:id — single category by MongoDB ObjectId.
 *
 * @param {string} id — MongoDB ObjectId string
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { category }
 */
export const getCategoryById = (id) =>
  api.get(buildEndpoint(CATEGORY_ENDPOINTS.BY_ID, { id }));

/**
 * GET /categories/:id/breadcrumb — ancestor chain from root to this category.
 * Used by CategoryBreadcrumb to render Home > Parent > Child path.
 *
 * @param {string} id — MongoDB ObjectId of the current category
 * @returns {Promise<AxiosResponse>}
 *   response.data.data → { breadcrumb: [{ _id, name, slug }, ...] }
 *   Ordered from root (index 0) to immediate parent.
 */
export const getCategoryBreadcrumb = (id) =>
  api.get(buildEndpoint(CATEGORY_ENDPOINTS.BREADCRUMB, { id }));

// ─── Admin category mutations ──────────────────────────────────────────────────

/**
 * POST /categories — Create a new category (admin only).
 * @param {FormData} formData
 */
export const createCategory = (formData) => {
  return api.post("/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * PUT /categories/:id — Update an existing category (admin only).
 * @param {string} id
 * @param {FormData} formData
 */
export const updateCategory = (id, formData) => {
  return api.put(`/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * DELETE /categories/:id — Archive/soft-delete a category (admin only).
 * @param {string} id
 */
export const deleteCategory = (id) => {
  return api.delete(`/categories/${id}`);
};

/**
 * PATCH /categories/:id/status — Toggle a category's active/inactive status (admin only).
 * @param {string} id
 * @param {boolean} isActive
 */
export const toggleCategoryStatus = (id, isActive) => {
  return api.patch(`/categories/${id}/status`, { status: isActive ? "active" : "inactive" });
};
