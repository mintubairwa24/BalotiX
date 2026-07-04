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