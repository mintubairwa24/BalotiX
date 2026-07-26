/**
 * FILE: src/store/ADMIN_store_index_update.js
 *
 * ============================================================================
 * src/store/index.js — UPDATE SNIPPET (Phase 17)
 * ============================================================================
 * Add this single export line to your existing store barrel, alongside the
 * other 9 stores (auth, cart, wishlist, address, checkout, notifications,
 * ui, filters, orders — whatever your current 9 are named).
 *
 * DO NOT replace the file — this is an ADDITION only.
 * ============================================================================
 */

// Add this line to src/store/index.js:
export { useAdminDashboardStore } from "./adminDashboard.store";

/**
 * Resulting file should look like (illustrative — keep your existing 9 lines,
 * just add the new one):
 *
 *   export { useAuthStore } from "./auth.store";
 *   export { useCartStore } from "./cart.store";
 *   export { useWishlistStore } from "./wishlist.store";
 *   export { useAddressStore } from "./address.store";
 *   export { useCheckoutStore } from "./checkout.store";
 *   export { useNotificationsStore } from "./notifications.store";
 *   export { useUiStore } from "./ui.store";
 *   export { useFiltersStore } from "./filters.store";
 *   export { useOrdersStore } from "./orders.store";
 *   export { useAdminDashboardStore } from "./adminDashboard.store";  // <-- NEW
 */
