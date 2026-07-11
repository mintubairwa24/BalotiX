/**
 * src/api/endpoints.js
 *
 * PURPOSE:
 *   Centralized registry of every backend API path. Service files import
 *   path constants from here instead of hardcoding strings inline.
 *
 * WHY THIS EXISTS:
 *   - One place to update if a backend route path ever changes
 *   - Prevents typos in repeated path strings across multiple service files
 *   - Makes it trivial to grep "what endpoints exist" in one file
 *
 * SCALABILITY:
 *   As each backend module's service file is built (product.service.js,
 *   cart.service.js, etc.), its endpoints are added here following the
 *   same nested-object pattern as AUTH_ENDPOINTS below.
 *
 * Today this file only contains AUTH_ENDPOINTS, matching the
 * Authentication module being built right now.
 */

export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh-token",
  ME: "/auth/me",
  STATUS: "/auth/status",
  VERIFY_EMAIL: "/auth/verify-email",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
};

// ─── Products ─────────────────────────────────────────────────────────────────
// Mirrors backend product routes (PROJECT_CONTEXT.md Part 4 — Product Routes).
export const PRODUCT_ENDPOINTS = {
  LIST:        "/products",              // GET  — paginated listing with filters
  FEATURED:    "/products/featured",     // GET  — homepage featured products
  SEARCH:      "/products/search",       // GET  — full-text search ?q=
  BY_ID:       "/products/:id",          // GET  — single product by ObjectId
  BY_SLUG:     "/products/slug/:slug",   // GET  — SEO product detail page
};

// ─── Categories ───────────────────────────────────────────────────────────────
// Mirrors: src/modules/categories/ routes in the NexCart backend.
// LIST query params: flat (true|false), status ("active"|"inactive"), parentId
export const CATEGORY_ENDPOINTS = {
  LIST:       "/categories",                   // GET — all categories
  BY_ID:      "/categories/:id",               // GET — single by ObjectId
  BY_SLUG:    "/categories/slug/:slug",        // GET — single by URL slug
  BREADCRUMB: "/categories/:id/breadcrumb",    // GET — ancestor chain root→parent
};



// Place alongside PRODUCT_ENDPOINTS and CATEGORY_ENDPOINTS.
// Every wishlist path lives here — components and services never hardcode URLs.
// Function-form endpoints (REMOVE, MOVE_TO_CART) accept a productId at
// call-time so the service layer stays clean.
 
export const WISHLIST_ENDPOINTS = {
  // GET  /wishlist              — full wishlist with populated product objects
  LIST: "/wishlist",
 
  // POST /wishlist/items        — body: { productId }
  // Backend returns 200 even if already wishlisted (Rule 9 — not an error)
  ADD: "/wishlist/items",
 
  // DELETE /wishlist/items/:productId
  REMOVE: (productId) => `/wishlist/items/${productId}`,
 
  // POST /wishlist/items/:productId/move-to-cart — body: { quantity }
  // Backend is atomic: adds to cart AND removes from wishlist in one operation.
  // Frontend only needs to invalidate both caches on success.
  MOVE_TO_CART: (productId) => `/wishlist/items/${productId}/move-to-cart`,
};
 


/**
* Backend Path Mapping:
 * - GET  /api/cart              -> Get current cart
 * - POST /api/cart/items        -> Add item to cart
 * - PUT  /api/cart/items/:id    -> Update item quantity
 * - DEL  /api/cart/items/:id    -> Remove item from cart
 * - DEL  /api/cart              -> Clear entire cart
 * - POST /api/cart/coupon/validate -> Validate coupon (preview)
 * - POST /api/cart/coupon       -> Apply coupon
 * - DEL  /api/cart/coupon       -> Remove coupon
 * - POST /api/cart/checkout/start   -> Start checkout (lock + reserve)
 * - POST /api/cart/checkout/confirm -> Confirm payment
 * - POST /api/cart/checkout/abandon -> Cancel checkout
 */
 
// Add this object to your endpoints.js:
 
export const CART_ENDPOINTS = {
  // Basic cart operations
  GET: "/cart",
  ADD_ITEM: "/cart/items",
  UPDATE_ITEM: "/cart/items", // PUT /cart/items/:productId
  DELETE_ITEM: "/cart/items", // DEL /cart/items/:productId
  CLEAR: "/cart",
 
  // Coupon operations
  VALIDATE_COUPON: "/cart/coupon/validate",
  APPLY_COUPON: "/cart/coupon",
  REMOVE: "/car/coupon",
 
  // Checkout flow
  CHECKOUT_START: "/cart/checkout/start",
  CHECKOUT_CONFIRM: "/cart/checkout/confirm",
  CHECKOUT_ABANDON: "/cart/checkout/abandon",
};

export const SEARCH_ENDPOINTS = {
  SEARCH_PRODUCTS: "/search/products",
  GET_FILTERS: "/search/filters",
  APPLY_FILTERS: "/search/filters/apply",
};


export const ADDRESS_ENDPOINTS = {
  // All user addresses
  GET_ALL: "/address",
 
  // Single address operations
  GET_ONE: (id) => `/address/${id}`,
  CREATE: "/address",
  UPDATE: (id) => `/address/${id}`,
  DELETE: (id) => `/address/${id}`,
 
  // Set default address
  SET_DEFAULT: (id) => `/address/${id}/set-default`,
};
 

// ============================================================================
// FUTURE PHASE ENDPOINTS (Placeholder)
// ============================================================================
 
// Phase 12: Checkout & Payment
// export const CHECKOUT_ENDPOINTS = { ... };
// export const PAYMENT_ENDPOINTS = { ... };

export const ORDER_ENDPOINTS = {
  CREATE: "/orders",
  GET_ALL: "/orders",
  GET_BY_ID: (id) => `/orders/${id}`,
};
 
// Phase 13: Orders
// export const ORDER_ENDPOINTS = { ... };
 
// Admin: Management Endpoints
// export const ADMIN_ENDPOINTS = { ... };

export const PAYMENT_ENDPOINTS = {
  CREATE_SESSION: "/payment/create-order",
  VERIFY: "/payment/verify",
  GET_STATUS: (orderId) => `/payment/status/${orderId}`,
};