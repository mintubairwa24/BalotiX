/**
 * FILE: src/services/inventory.service.js
 *
 * ============================================================================
 * INVENTORY SERVICE — Phase 18F Extension (Admin Inventory Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Inventory is one of the ten backend modules already built (per
 * PROJECT_CONTEXT: Product, Category, Inventory, Cart, Wishlist, Coupons,
 * Orders, Payments, Reviews, Notifications) — but unlike Product or
 * Category, Inventory has NO customer-facing surface at all (customers
 * only ever see a product's `stock` field on the product page, via
 * product.service.js; they never interact with an "inventory" concept
 * directly). This means, unlike coupon.service.js/category.service.js
 * (which already had Phase 6/10 customer-facing functions to extend),
 * this file is effectively being introduced fresh, entirely for this
 * admin phase — the "extension" here means adding to whatever minimal
 * internal shape may already exist, not modifying a customer-facing
 * surface.
 *
 * WHY THIS FILE OWNS STOCK MUTATIONS (not admin.service.js):
 * Same resource-ownership rule as every prior phase: mutations act on the
 * inventory resource itself, so they belong in the file that owns that
 * resource's Axios surface. The admin-only LIST/DETAIL reads (which need
 * richer, paginated, filterable data no single-item mutation needs) live
 * in admin.service.js instead — see that file's header for why.
 *
 * BACKEND CONTRACT (ASSUMED — flagged, not verified against a live server):
 *   PATCH /inventory/:productId/stock   (admin-only)
 *     body: { type: "increase" | "decrease" | "set", quantity: number, reason?: string }
 *
 *   GET /inventory/:productId/history   (admin-only, FLAGGED — see below)
 *
 * WHY ADJUSTMENT IS SUBMIT-A-DELTA, NOT SUBMIT-A-FINAL-NUMBER (this is
 * the single most important design decision in this file): the admin
 * chooses a `type` (increase/decrease/set) and a `quantity` — the
 * resulting stock count is computed ENTIRELY server-side. This
 * deliberately avoids a classic race-condition bug class: if this
 * frontend instead read the current stock, did math client-side, and
 * submitted a final number, two admins adjusting stock concurrently (or
 * a stock change from a concurrent order) could silently overwrite each
 * other. Submitting an intent ("increase by 10") rather than a computed
 * result ("set to 47") lets the backend apply it atomically against
 * whatever the current value actually is at write time — this is also
 * exactly what "reuse backend stock adjustment logic" in the brief means:
 * the adjustment ALGORITHM stays backend-owned, this file only transports
 * the admin's stated intent.
 *
 * WHY STOCK HISTORY IS FLAGGED, NOT ASSUMED CONFIRMED:
 * The brief says "Stock history (if backend supports it)." Nothing in
 * prior phases confirmed a stock-movement audit log exists. StockHistory
 * (the component consuming this) is built to degrade gracefully to an
 * empty/unavailable state if this endpoint 404s, rather than assuming its
 * presence blindly — same resilience principle as CategoryTree's
 * documented fallback in Phase 18D.
 *
 * PRODUCTION-READY BECAUSE:
 * - Every function returns the full Axios response (project-wide convention)
 * - adjustStock's payload shape matches exactly what StockAdjustmentForm
 *   collects — no client-side recomputation between form and request
 */

import api from "../api/axios";

const INVENTORY_ADMIN_ENDPOINTS = {
  ADJUST_STOCK: (productId) => `/inventory/${productId}/adjust`,
  HISTORY: (productId) => `/inventory/${productId}/movements`,
};

/**
 * Submit a stock adjustment for one product's inventory. The backend
 * computes the resulting stock — this never sends a pre-computed final
 * number (see file header for why).
 *
 * @param {string} productId
 * @param {object} adjustment - { type: "increase"|"decrease"|"set", quantity: number, reason?: string }
 */
export const adjustStock = (productId, adjustment) => {
  return api.patch(INVENTORY_ADMIN_ENDPOINTS.ADJUST_STOCK(productId), adjustment);
};

/**
 * Fetch the stock movement history for one product.
 * FLAGGED: not confirmed to exist — see file header. StockHistory.jsx
 * handles a 404/error from this gracefully.
 * @param {string} productId
 */
export const getStockHistory = (productId) => {
  return api.get(INVENTORY_ADMIN_ENDPOINTS.HISTORY(productId));
};

