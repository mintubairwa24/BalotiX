// src/services/wishlist.service.js
//
// WHY THIS FILE EXISTS:
// The service layer is the single point of contact between the frontend and
// the wishlist backend module. Keeping HTTP calls here (not in hooks, not in
// components) means:
//   • Services are unit-testable without React or a QueryClient
//   • A URL change is made in ONE place (endpoints.js + here)
//   • Hooks stay thin: they own caching and UI logic, not request building
//
// BACKEND INTEGRATION:
// Base URL comes from the shared Axios instance (src/api/axios.js).
// withCredentials: true is set on the instance — never override.
// All four wishlist endpoints require Customer authentication via HttpOnly
// cookie. The Axios interceptor (src/api/interceptors.js) handles 401 →
// refresh → retry transparently. Services don't know or care about auth.
//
// RESPONSE ENVELOPE:
// All responses follow { success, message, data: { ... } }.
// Services return the full Axios response. Hooks extract:
//   response.data.data   — the wishlist object / success payload
//
// FUTURE MODULES:
// Phase 8  — useWishlist.js consumes all four functions
// Phase 9  — ProductDetailsPage's WishlistButton indirectly calls these via hooks
// Phase 12 — Admin: wishlist analytics go through a separate admin service

import api from "../api/axios";
import { WISHLIST_ENDPOINTS } from "../api/endpoints";

// ─── GET /wishlist ───────────────────────────────────────────────────────────
/**
 * Fetch the current user's full wishlist.
 * Response shape: { _id, userId, items: [{ _id, productId: { ...product }, addedAt }] }
 * productId is a fully populated product object (name, slug, effectivePrice, etc.)
 */
export const getWishlist = () => api.get(WISHLIST_ENDPOINTS.LIST);

// ─── POST /wishlist/items ────────────────────────────────────────────────────
/**
 * Add a product to the wishlist.
 *
 * IMPORTANT (Business Rule 9):
 * The backend returns 200 if the product is already in the wishlist.
 * This is NOT an error — the hook treats it as success and shows
 * "Already saved" state rather than an error toast.
 *
 * @param {{ productId: string }} payload
 */
export const addToWishlist = (payload) =>
  api.post(WISHLIST_ENDPOINTS.ADD, payload);

// ─── DELETE /wishlist/items/:productId ──────────────────────────────────────
/**
 * Remove a specific product from the wishlist by its productId.
 * The wishlist item _id is NOT needed — productId is the identifier here.
 *
 * @param {string} productId  — the product's MongoDB ObjectId
 */
export const removeFromWishlist = (productId) =>
  api.delete(WISHLIST_ENDPOINTS.REMOVE(productId));

// ─── POST /wishlist/items/:productId/move-to-cart ───────────────────────────
/**
 * Atomically moves a product from wishlist to cart (one backend operation).
 *
 * FRONTEND CONTRACT (from Phase 8 spec):
 * • On success  → invalidate both ["wishlist"] AND ["cart"] caches
 * • On failure  → item stays in wishlist; show error toast
 * No custom transaction logic — the backend handles atomicity.
 *
 * @param {string} productId
 * @param {{ quantity: number }} payload  — defaults to { quantity: 1 }
 */
export const moveToCart = (productId, payload = { quantity: 1 }) =>
  api.post(WISHLIST_ENDPOINTS.MOVE_TO_CART(productId), payload);