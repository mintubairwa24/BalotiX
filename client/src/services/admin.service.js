/**
 * FILE: src/services/admin.service.js
 *
 * ============================================================================
 * src/services/admin.service.js
 * ADMIN SERVICE — Phase 17 Extension (Admin Dashboard Integration)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Pure Axios layer for admin-only operations. Phase 17 only needs ONE
 * function here — a recent-activity feed for the dashboard overview.
 * Everything else admin-related (Product/Category/User/Order/Coupon CRUD)
 * is explicitly OUT OF SCOPE for this phase and will get its own service
 * functions added here in future phases — this file is designed to grow,
 * not be rewritten.
 *
 * BACKEND CONTRACT (ASSUMED):
 *   GET /admin/activity?limit={n}
 *   Response: {
 *     success: true,
 *     data: {
 *       activities: [
 *         {
 *           _id: string,
 *           type: string,        // e.g. "order" | "payment" | "user" | "review" | "system"
 *                                 // NOTE: this is a DIFFERENT enum from Order status
 *                                 // (pending_payment|confirmed|...) — see RecentActivity.jsx
 *                                 // for why we don't reuse OrderStatusBadge for this.
 *           message: string,     // human-readable, e.g. "New order #1234 placed"
 *           timestamp: string,   // ISO date string
 *           actionUrl: string,   // optional deep link, e.g. "/admin/orders/1234"
 *         }
 *       ]
 *     }
 *   }
 *
 * This endpoint path/shape is NOT verified against a live backend in this
 * environment — flagged here so only ADMIN_ENDPOINTS.RECENT_ACTIVITY needs
 * to change if the real contract differs.
 *
 * PRODUCTION-READY BECAUSE:
 * - `limit` is a query param, not hardcoded — dropdown-preview vs full-page
 *   uses (mirrors the Phase 16 Notifications pattern: same fetcher, two
 *   different page/limit combinations) can both call this function.
 * - Returns the full Axios response for consistency with every other
 *   service file in the project.
 */

import api from "../api/axios";

const ADMIN_ENDPOINTS = {
  RECENT_ACTIVITY: "/admin/activity",
  PRODUCTS: "/admin/products",
  PRODUCT_MEDIA: (id) => `/admin/products/${id}/media`,
  CATEGORIES: "/admin/categories",
  CATEGORY_TREE: "/admin/categories/tree",
  USERS: "/admin/users",
  USER_BY_ID: (id) => `/admin/users/${id}`,
  COUPONS: "/coupons",
  COUPON_BY_ID: (id) => `admin/coupons/${id}`,
  COUPON_USAGE: (id) => `admin/coupons/${id}/usage`,
  INVENTORY: "/inventory",
  INVENTORY_BY_ID: (productId) => `/inventory/${productId}`,
  REVIEWS: "/admin/reviews",
  REVIEW_BY_ID: (id) => `/admin/reviews/${id}`,
  REVIEW_HIDE: (id) => `/admin/reviews/${id}/hide`,
  REVIEW_RESTORE: (id) => `/admin/reviews/${id}/restore`,
  ORDERS_OVERVIEW: "/admin/orders/overview",
};

/**
 * Fetch recent admin-relevant activity (orders, payments, signups, etc.)
 * for the dashboard's RecentActivity feed.
 *
 * @param {number} limit - max number of activity items to fetch (default 10)
 * @returns {Promise<AxiosResponse>} full axios response; caller extracts
 *          response.data.data.activities in the hooks layer.
 */
export const getRecentActivity = (limit = 10) => {
  return api.get(ADMIN_ENDPOINTS.RECENT_ACTIVITY, {
    params: { limit },
  });
};

/**
 * Fetch the admin-only product listing — includes inactive/draft products,
 * unlike the customer-facing catalog.
 *
 * @param {object} params - { page, limit, search, category, status, sortBy, sortOrder }
 * @returns {Promise<AxiosResponse>} full axios response; caller extracts
 *          response.data.data.{products,pagination} in the hooks layer.
 */
export const getAdminProducts = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.PRODUCTS, { params });
};

/**
 * Fetch full admin-only detail for one product.
 * @param {string} productId
 */
export const getAdminProductById = (productId) => {
  return api.get(ADMIN_ENDPOINTS.PRODUCTS + `/${productId}`);
};

/**
 * Fetch the full, admin-only media set for one product — richer shape
 * (order, isFeatured, publicId) than the customer-facing product detail
 * response provides.
 * @param {string} productId
 * @returns {Promise<AxiosResponse>} full axios response; caller extracts
 *          response.data.data.images in the hooks layer.
 */
export const getAdminProductMedia = (productId) => {
  return api.get(ADMIN_ENDPOINTS.PRODUCT_MEDIA(productId));
};

/**
 * Fetch the admin-only category listing — includes inactive categories and
 * full parent/child relationship data, unlike the customer-facing list.
 *
 * @param {object} params - { page, limit, search, status, parent, sortBy, sortOrder }
 * @returns {Promise<AxiosResponse>} full axios response; caller extracts
 *          response.data.data.{categories,pagination} in the hooks layer.
 */
export const getAdminCategories = (params = {}) => {
  return api.get("/categories", {
    params: { flat: true, ...params }
  });
};

/**
 * Fetch the admin category tree (nested parent/child structure).
 */
export const getAdminCategoryTree = () => {
  return api.get("/categories", {
    params: { flat: false },
  });
};

/**
 * Fetch the admin-only user listing.
 * @param {object} params - { page, limit, search, status, sortBy, sortOrder }
 */
export const getAdminUsers = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.USERS, { params });
};

/**
 * Fetch full admin-only detail for one user.
 * @param {string} userId
 */
export const getAdminUserById = (userId) => {
  return api.get(ADMIN_ENDPOINTS.USER_BY_ID(userId));
};

/**
 * Fetch the admin-only coupon listing.
 * @param {object} params - { page, limit, search, status, sortBy, sortOrder }
 */
export const getAdminCoupons = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.COUPONS, { params });
};

/**
 * Fetch a single coupon's full admin detail.
 * @param {string} couponId
 */
export const getAdminCouponById = (couponId) => {
  return api.get(ADMIN_ENDPOINTS.COUPON_BY_ID(couponId));
};

/**
 * Fetch coupon usage history.
 * @param {string} couponId
 * @param {object} params
 */
export const getAdminCouponUsage = (couponId, params = {}) => {
  return api.get(ADMIN_ENDPOINTS.COUPON_USAGE(couponId), { params });
};

/**
 * Fetch the admin-only, paginated inventory listing.
 * @param {object} params - { page, limit, search, status, sortBy, sortOrder }
 */
export const getAdminInventory = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.INVENTORY, { params });
};

/**
 * Fetch full admin-only detail for one product's inventory record.
 * @param {string} productId
 */
export const getAdminInventoryDetail = (productId) => {
  return api.get(ADMIN_ENDPOINTS.INVENTORY_BY_ID(productId));
};

/**
 * Fetch the admin review listing with filtering, sorting, and pagination.
 * @param {object} params - { page, limit, search, moderationStatus, rating, sortBy, sortOrder }
 */
export const getAdminReviews = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.REVIEWS, { params });
};

/**
 * Fetch full admin detail for one review.
 * @param {string} reviewId
 */
export const getAdminReviewById = (reviewId) => {
  return api.get(ADMIN_ENDPOINTS.REVIEW_BY_ID(reviewId));
};

/**
 * Hide a review from the storefront.
 * @param {string} reviewId
 */
export const hideAdminReview = (reviewId) => {
  return api.patch(ADMIN_ENDPOINTS.REVIEW_HIDE(reviewId));
};

/**
 * Restore a hidden review to the storefront.
 * @param {string} reviewId
 */
export const restoreAdminReview = (reviewId) => {
  return api.patch(ADMIN_ENDPOINTS.REVIEW_RESTORE(reviewId));
};

/**
 * Permanently delete a review.
 * @param {string} reviewId
 */
export const deleteAdminReview = (reviewId) => {
  return api.delete(ADMIN_ENDPOINTS.REVIEW_BY_ID(reviewId));
};

/**
 * ---------------------------------------------------------------------------
 * PHASE 18H — ANALYTICS & REPORTS (order breakdown only)
 * ---------------------------------------------------------------------------
 * Fetch order overview data for analytics charts (order count over time
 * and status breakdown). Uses the backend GET /api/admin/orders/overview
 * endpoint.
 *
 * BACKEND CONTRACT (ASSUMED):
 *   GET /admin/orders/overview?startDate=&endDate=
 *   Response: {
 *     success: true,
 *     data: {
 *       series: [{ date, orderCount }],
 *       byStatus: [{ status, count }]
 *     }
 *   }
 *
 * @param {object} params - { startDate, endDate }
 */
export const getAdminOrdersOverview = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.ORDERS_OVERVIEW, { params });
};
