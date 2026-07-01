/**
 * src/constants/route.constants.js
 *
 * PURPOSE:
 *   Single source of truth for every application route path.
 *   Components use ROUTES.LOGIN instead of "/login" so that:
 *   - A path rename is one line change, not a grep-and-replace
 *   - Typos in path strings are caught by JS reference errors
 *
 * USAGE:
 *   import { ROUTES } from "../constants/route.constants";
 *   <Link to={ROUTES.LOGIN}>Sign In</Link>
 *   navigate(ROUTES.HOME);
 */

export const ROUTES = {
  // Public
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:slug",
  CATEGORY: "/category/:slug",
  SEARCH: "/search",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",

  // Customer
  CART: "/cart",
  WISHLIST: "/wishlist",
  CHECKOUT: "/checkout",
  CHECKOUT_SUCCESS: "/checkout/success",
  CHECKOUT_FAILED: "/checkout/failed",

  // Account
  ACCOUNT: "/account",
  ACCOUNT_PROFILE: "/account/profile",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_ORDER_DETAIL: "/account/orders/:id",
  ACCOUNT_WISHLIST: "/account/wishlist",
  ACCOUNT_NOTIFICATIONS: "/account/notifications",
  ACCOUNT_REVIEWS: "/account/reviews",

  // Admin
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_COUPONS: "/admin/coupons",

  // Errors
  NOT_FOUND: "/404",
  SERVER_ERROR: "/500",
};

/**
 * Helper to build parameterised paths at runtime.
 * ROUTES.PRODUCT_DETAIL has ":slug" — this replaces it with the real value.
 *
 * Usage:
 *   buildPath(ROUTES.PRODUCT_DETAIL, { slug: "iphone-15-pro" })
 *   → "/products/iphone-15-pro"
 */
export const buildPath = (route, params = {}) => {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route
  );
};