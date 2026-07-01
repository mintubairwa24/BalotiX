/**
 * src/store/index.js
 *
 * Barrel export for all Zustand stores.
 * Import from here so no component needs to know the exact file path:
 *   import { useCartStore, useAuthStore } from "../store";
 */

export { useAuthStore } from "./auth.store";
export { useCartStore } from "./cart.store";
export { useWishlistStore } from "./wishlist.store";
export { useNotificationStore } from "./notification.store";
export { useThemeStore } from "./theme.store";