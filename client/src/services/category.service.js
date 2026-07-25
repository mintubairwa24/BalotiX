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
 * @param {object} categoryData - Plain JS object, e.g., { name, description, parentId }
 */
export const createCategory = (categoryData) => {
  // FIX: The server is expecting a JSON payload, not 'multipart/form-data'.
  // Sending FormData was causing `req.body` to be undefined on the server because
  // the `express.json()` middleware does not parse that content type.
  // By sending a plain JavaScript object, Axios automatically sets the
  // 'Content-Type' to 'application/json', which the server can parse correctly.
  return api.post("/categories", categoryData);
};

/**
 * PATCH /categories/:id — Update an existing category (admin only).
 * @param {string} id
 * @param {object} updateData - Plain JS object with fields to update.
 */
export const updateCategory = (id, updateData) => {
  // FIX: Changed to send JSON for the same reason as createCategory.
  // Also changed from PUT to PATCH. The backend service logic performs a
  // partial update, which semantically matches PATCH and is consistent
  // with other modules like user.service.js.
  return api.patch(`/categories/${id}`, updateData);
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




/**
 * ---------------------------------------------------------------------------
 * PHASE 18D — SOFT DELETE / RESTORE
 * ---------------------------------------------------------------------------
 * WHY deleteCategory NOW HAS TWO POSSIBLE MEANINGS (flagged): the Phase 18D
 * brief distinguishes "Hard delete / Soft delete / Restore... only if
 * supported." deleteCategory (defined above, unchanged) is assumed to be
 * whichever ONE of hard/soft delete your backend actually implements at
 * DELETE /categories/:id — this service layer doesn't try to guess which,
 * since that's a single backend behavior, not a frontend choice. What IS a
 * frontend addition is `restoreCategory` below, which only makes sense
 * paired with a SOFT delete — if your DELETE endpoint hard-deletes,
 * restoreCategory has nothing to reverse and DeleteCategoryModal's restore
 * path (see that file) simply never triggers in practice.
 *
 * Same suspend/restore split reasoning already used in Phase 18C's
 * user.service.js — restore is a separate, non-destructive PATCH, not
 * folded into the status toggle.
 */
 
/**
 * Restore a soft-deleted category.
 * FLAGGED: only meaningful if your backend's DELETE /categories/:id is a
 * soft delete — see note above.
 * @param {string} id
 */
export const restoreCategory = (id) => {
  return api.patch(`/categories/${id}/status`, { status: "active" });
};
