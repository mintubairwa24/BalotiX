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
/** Phase 17 — unchanged. */ 
export const getRecentActivity = (limit = 10) => {  
  return api.get(ADMIN_ENDPOINTS.RECENT_ACTIVITY, {
    params: { limit },
  });
};

// NOTE: Future phases (Product/Category/User/Order/Coupon CRUD, Phase 18+)
// will add their functions below this line, keeping this file the single
// home for all admin-only Axios calls — consistent with how cart.service.js,
// order.service.js etc. each own their entire feature's API surface.



/**
 * Fetch recent admin-relevant activity (Phase 17 — unchanged this phase).
//  * @param {number} limit
 */
// export const getRecentActivity = (limit = 10) => {
//   return axiosInstance.get(ADMIN_ENDPOINTS.RECENT_ACTIVITY, {
//     params: { limit },
//   });
// };
 
/**
 * Fetch the admin-only product listing — includes inactive/draft products,
 * unlike the customer-facing catalog.
 *
 * @param {object} params - { page, limit, search, category, status, sortBy, sortOrder }
 * @returns {Promise<AxiosResponse>} full axios response; caller extracts
 *          response.data.data.{products,pagination} in the hooks layer.
 */

/** Phase 18A — unchanged. */
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
 
// NOTE: Future phases (Category/User/Order/Coupon admin CRUD) will add
// their own admin-scoped read functions below this line, following the
// same "admin-only shape => lives here" rule established above.


 
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
  // Admin uses the public categories endpoint to get all categories including inactive.
  // The backend getAllCategories supports query params: flat, status, parentId, ancestorOf, page, limit
  return api.get("/categories", { 
    params: { flat: true, ...params }
  });
};
 
// NOTE: Future admin-CRUD phases (User/Order/Coupon) will add their own
// admin-scoped reads below this line, following the same rule.
 


/**
 * ---------------------------------------------------------------------------
 * PHASE 18D — CATEGORY HIERARCHY TREE
 * ---------------------------------------------------------------------------
 * WHY THIS IS THE MOST SPECULATIVE ENDPOINT IN THIS PHASE (flagged
 * explicitly): Phase 18B confirmed a FLAT paginated category list with a
 * `parentCategory` ref per item — nothing confirmed a dedicated
 * tree-shaped endpoint exists. This function assumes one for convenience
 * (a pre-nested response is cheaper to render than reconstructing a tree
 * client-side from a flat list), but CategoryTree.jsx (the consumer) is
 * built to ALSO work by nesting the flat getAdminCategories() results
 * itself if this endpoint 404s — see that file's header for the fallback
 * logic. This is the one place in this phase where "do not invent
 * endpoints" is balanced against "the feature needs *some* data shape,"
 * resolved by making the consumer resilient to either shape rather than
 * assuming the riskier one blindly.
 *
 * BACKEND CONTRACT (ASSUMED):
 *   GET /admin/categories/tree
 *   Response: {
 *     success: true,
 *     data: {
 *       tree: [{ _id, name, slug, isActive, productCount,
 *                 children: [ ...same shape, recursively... ] }]
 *     }
 *   }
 */
export const getAdminCategoryTree = () => {
  return api.get("/categories", {
    params: { flat: false },
  });
};
 

export const getAdminUsers = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.USERS, { params });
};
 
/**
 * Fetch full admin-only detail for one user — profile + addresses +
 * order summary + activity, in one round trip.
 * @param {string} userId
 */
export const getAdminUserById = (userId) => {
  return api.get(ADMIN_ENDPOINTS.USER_BY_ID(userId));
};
 
// NOTE: Future admin-CRUD phases (Order/Coupon) will add their own
// admin-scoped reads below this line, following the same rule.
 


/**
 * ---------------------------------------------------------------------------
 * PHASE 18E — ADMIN COUPON MANAGEMENT
 * ---------------------------------------------------------------------------
 * WHY getAdminCoupons LIVES HERE, NOT coupon.service.js:
 * Identical reasoning to every prior admin-list split (Products,
 * Categories, Users): the admin coupon table needs richer, admin-only
 * data — usage statistics (how many times redeemed, total discount
 * given), inactive/expired coupons alongside active ones — that the
 * customer-facing coupon.service.js (Phase 10, scoped to "validate this
 * one code at checkout") has no reason to ever return. Mutations
 * (create/update/delete/status), by contrast, act on the same resource as
 * that customer-facing validation, so those live in coupon.service.js —
 * see that file's header for the mutation-side reasoning.
 *
 * BACKEND CONTRACT (ASSUMED — flagged, not verified against a live server):
 *   GET /admin/coupons?page=&limit=&search=&status=&sortBy=&sortOrder=
 *   Response: {
 *     success: true,
 *     data: {
 *       coupons: [{ _id, code, discountType, discountValue, minOrderValue,
 *                    maxDiscountAmount, expiryDate, usageLimit, usageCount,
 *                    isActive, createdAt }],
 *       pagination: { page, limit, totalPages, totalCount }
 *     }
 *   }
 * Reuses the SAME page/limit/search/sortBy/sortOrder query shape already
 * established by getAdminProducts/getAdminCategories/getAdminUsers,
 * per the project's convention of one admin-list query contract across
 * every resource. `usageCount` (redemptions so far) is assumed to travel
 * directly on each list item — CouponUsage.jsx reads it straight from
 * there rather than a separate stats endpoint, since per-coupon usage is
 * exactly the kind of denormalized counter a list response would already
 * carry (same pattern as `productCount` on admin categories, Phase 18B).
 *
 * PRODUCTION-READY BECAUSE:
 * - Query params passed as a single `params` object straight through to
 *   Axios — no manual query-string building
 * - Returns the full Axios response, same contract as every other service
 *   function in this project
 */
export const getAdminCoupons = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.COUPONS, { params });
};
 
/**
 * Fetch a single coupon's full admin detail — needed by EditCouponPage.
 *
 * WHY THIS EXISTS (unlike Products/Categories, which reuse a
 * customer-facing detail hook for their edit pages — see EditProductPage/
 * EditCategoryPage's flagged risk notes): coupons have no customer-facing
 * "detail page" equivalent to reuse. Customers only ever validate a
 * coupon CODE at checkout (Phase 10) — there's no public GET
 * /coupons/:id a browsing customer would ever hit, so there's nothing to
 * reuse the way useProduct(id)/useCategory(id) were reused. This is a
 * genuinely new, admin-only single-item read, added here (not a new file)
 * since admin.service.js is already the established home for admin-only
 * reads and is already in scope for this phase's service extension.
 *
 * @param {string} couponId
 */
export const getAdminCouponById = (couponId) => {
  return api.get(ADMIN_ENDPOINTS.COUPON_BY_ID(couponId));
};

export const getAdminCouponUsage = (couponId, params = {}) => {
  return api.get(ADMIN_ENDPOINTS.COUPON_USAGE(couponId), { params });
};
 
// NOTE: Future admin-CRUD phases (Order Management, if not already
// covered) will add their own admin-scoped reads below this line,
// following the same rule.
 


/**
 * ---------------------------------------------------------------------------
 * PHASE 18F — ADMIN INVENTORY MANAGEMENT
 * ---------------------------------------------------------------------------
 * WHY getAdminInventory / getAdminInventoryDetail LIVE HERE, NOT
 * inventory.service.js: Same rule as every prior admin-list split — these
 * are admin-only READS with richer, paginated/filterable/sortable shapes
 * that no customer-facing surface needs (inventory has no customer-facing
 * surface at ALL, unlike Products/Categories/Coupons — see
 * inventory.service.js's header). Mutations (stock adjustment) act on the
 * inventory resource itself, so those live in inventory.service.js.
 *
 * WHY THE IDENTIFIER IS A productId, NOT A SEPARATE "inventoryId":
 * Per the assumed 1:1 relationship between a Product and its Inventory
 * record (an Inventory row is provisioned alongside product creation,
 * Phase 5), this frontend treats inventory as addressed BY product id
 * throughout — there is no separate inventory-specific identifier
 * surfaced anywhere in this phase's UI. If the real backend uses a
 * distinct inventory `_id`, only the URL params below need updating;
 * every component in this phase passes `productId` consistently, so the
 * blast radius of that assumption being wrong is contained to these two
 * functions plus inventory.service.js's adjustStock/getStockHistory.
 *
 * BACKEND CONTRACT (ASSUMED — flagged, not verified against a live server):
 *   GET /admin/inventory?page=&limit=&search=&status=&sortBy=&sortOrder=
 *   Response: {
 *     success: true,
 *     data: {
 *       items: [{ productId, productName, productImage, sku,
 *                  currentStock, reservedStock, lowStockThreshold,
 *                  status: "in_stock"|"low_stock"|"out_of_stock",
 *                  updatedAt }],
 *       pagination: { page, limit, totalPages, totalCount },
 *       summary: { totalItems, lowStockCount, outOfStockCount }
 *     }
 *   }
 *   `status` here is BACKEND-COMPUTED (see inventory status reasoning in
 *   InventoryStatus.jsx's header) — this frontend only ever filters BY it
 *   and displays it, never derives it from currentStock/threshold itself.
 *   `summary` (flagged, assumed) powers LowStockCard's counts without a
 *   separate request — if it's not actually in the list response, the
 *   fallback is documented in LowStockCard.jsx.
 *
 *   GET /admin/inventory/:productId
 *   Response: {
 *     success: true,
 *     data: {
 *       item: { ...same shape as list item, full detail }
 *     }
 *   }
 *
 * PRODUCTION-READY BECAUSE:
 * - Reuses the SAME page/limit/search/sortBy/sortOrder query shape
 *   already established by every prior admin list endpoint
 * - Returns the full Axios response, same contract as every other service
 *   function in this project
 */
 
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
 *
 * @param {object} params - { page, limit, search, moderationStatus, rating, sortBy, sortOrder }
 */
export const getAdminReviews = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.REVIEWS, { params });
};

/**
 * Fetch full admin detail for one review.
 *
 * @param {string} reviewId
 */
export const getAdminReviewById = (reviewId) => {
  return api.get(ADMIN_ENDPOINTS.REVIEW_BY_ID(reviewId));
};

/**
 * Hide a review from the storefront.
 *
 * @param {string} reviewId
 */
export const hideAdminReview = (reviewId) => {
  return api.patch(ADMIN_ENDPOINTS.REVIEW_HIDE(reviewId));
};

/**
 * Restore a hidden review to the storefront.
 *
 * @param {string} reviewId
 */
export const restoreAdminReview = (reviewId) => {
  return api.patch(ADMIN_ENDPOINTS.REVIEW_RESTORE(reviewId));
};

/**
 * Permanently delete a review.
 *
 * @param {string} reviewId
 */
export const deleteAdminReview = (reviewId) => {
  return api.delete(ADMIN_ENDPOINTS.REVIEW_BY_ID(reviewId));
};


/**
 * ---------------------------------------------------------------------------
 * PHASE 18H — ANALYTICS & REPORTS (order breakdown only; everything else
 * for this phase lives in analytics.service.js)
 * ---------------------------------------------------------------------------
 * WHY getAdminOrdersOverview LIVES HERE, NOT analytics.service.js:
 * This is a read OVER THE ORDERS RESOURCE (status counts, order volume
 * over time) — same category as getAdminProducts/getAdminUsers/
 * getAdminCoupons/getAdminInventory: an admin-only aggregate view of an
 * existing resource this project manages. It belongs alongside those,
 * not in analytics.service.js, which this phase reserves for cross-
 * resource / genuinely analytical computations (revenue trends, customer
 * growth, top performers) that don't map onto any single existing admin
 * resource file. This mirrors exactly how InventoryInsights and
 * CouponAnalytics (this phase's components) reuse getAdminInventory/
 * getAdminCoupons directly rather than duplicating that data through a
 * new analytics endpoint — OrdersChart follows the same principle, it
 * just needed a genuinely new read since no admin.service.js function for
 * Orders existed yet.
 *
 * BACKEND CONTRACT (ASSUMED — flagged, not verified against a live server):
 *   GET /admin/orders/overview?startDate=&endDate=
 *   Response: {
 *     success: true,
 *     data: {
 *       series: [{ date, orderCount }],
 *       byStatus: [{ status, count }]
 *     }
 *   }
 *
 * PRODUCTION-READY BECAUSE:
 * - Reuses the same { startDate, endDate } param shape every other
 *   analytics read in this phase uses
 * - Returns the full Axios response, same contract as every other
 *   service function in this project
 */
export const getAdminOrdersOverview = (params = {}) => {
  return api.get(ADMIN_ENDPOINTS.ORDERS_OVERVIEW, { params });
};
 

// NOTE: Future admin-CRUD phases will add their own admin-scoped reads
// below this line, following the same rule.
