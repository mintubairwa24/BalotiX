// src/components/wishlist/WishlistButton/WishlistButton.jsx
//
// WHY THIS FILE EXISTS:
// WishlistButton is the universal "save to wishlist" affordance — a heart icon
// that appears on every product surface across the app. Building it as a
// standalone component (not embedded inside ProductCard) means:
//   • It can be dropped into any future product surface without refactoring
//   • Auth-redirect logic lives in one place
//   • Optimistic UI (instant heart toggle) is consistent everywhere
//
// HOW IT COMMUNICATES WITH THE BACKEND:
// WishlistButton does NOT call the backend directly. It calls:
//   useAddToWishlist()    → POST /wishlist/items
//   useRemoveFromWishlist() → DELETE /wishlist/items/:productId
// Both hooks handle optimistic Zustand updates, invalidation, and toasts.
//
// AUTH GUARD:
// If the user is not authenticated, clicking the heart redirects to /login
// with the current path in router state (state.from). The login page can
// redirect back after a successful sign-in.
// Auth check lives HERE (not in the hook) so hooks remain navigation-agnostic
// and composable in tests.
//
// FUTURE MODULES:
// Phase 9  — ProductDetailsPage drops this in as-is
// Phase 5  — ProductCard can import WishlistButton and place it as an overlay
// Phase 12 — Admin product table may include a wishlist count column (different)

import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";

import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useIsWishlisted,
} from "../../../hooks/useWishlist";
import { useAuthStore } from "../../../store";
import { ROUTES } from "../../../constants/route.constants";

// ─── Size map ────────────────────────────────────────────────────────────────
const SIZE_MAP = {
  sm: { button: "p-1.5", icon: 16 },
  md: { button: "p-2",   icon: 20 },
  lg: { button: "p-2.5", icon: 24 },
};

// ─── Component ───────────────────────────────────────────────────────────────
/**
 * @param {string}  productId     — required; MongoDB ObjectId of the product
 * @param {string}  productName   — used for aria-label (accessibility)
 * @param {'sm'|'md'|'lg'} size  — icon + padding size (default: "md")
 * @param {string}  className     — additional Tailwind classes for the wrapper
 */
export function WishlistButton({
  productId,
  productName = "this product",
  size = "md",
  className = "",
}) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated } = useAuthStore();

  const isWishlisted = useIsWishlisted(productId);

  const { mutate: addToWishlist,    isPending: isAdding }   = useAddToWishlist();
  const { mutate: removeFromWishlist, isPending: isRemoving } = useRemoveFromWishlist();

  const isLoading = isAdding || isRemoving;
  const { button: btnSize, icon: iconSize } = SIZE_MAP[size] ?? SIZE_MAP.md;

  // ─── Click handler ─────────────────────────────────────────────────────
  const handleToggle = (e) => {
    // Prevent click from bubbling to a parent Link (product card)
    e.preventDefault();
    e.stopPropagation();

    // Auth guard — redirect unauthenticated users to login
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location.pathname } });
      return;
    }

    if (isWishlisted) {
      removeFromWishlist({ productId });
    } else {
      addToWishlist({ productId });
    }
  };

  // ─── Aria label ────────────────────────────────────────────────────────
  const ariaLabel = isWishlisted
    ? `Remove ${productName} from wishlist`
    : `Save ${productName} to wishlist`;

  return (
    <motion.button
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={ariaLabel}
      aria-pressed={isWishlisted}
      title={ariaLabel}
      whileTap={{ scale: 0.85 }}
      className={[
        // Base shape
        "relative flex items-center justify-center rounded-full",
        "bg-white dark:bg-gray-800",
        "shadow-md border border-gray-100 dark:border-gray-700",
        btnSize,
        // Interaction states
        "transition-colors duration-200",
        "hover:bg-red-50 dark:hover:bg-red-900/20",
        isLoading
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer",
        className,
      ].join(" ")}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          // Spinner during mutation
          <motion.span
            key="spinner"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <Loader2
              size={iconSize}
              className="animate-spin text-gray-400 dark:text-gray-500"
            />
          </motion.span>
        ) : (
          // Heart icon — filled when wishlisted, outline when not
          <motion.span
            key={isWishlisted ? "filled" : "outline"}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Heart
              size={iconSize}
              className={
                isWishlisted
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500 hover:text-red-400"
              }
              fill={isWishlisted ? "currentColor" : "none"}
              strokeWidth={isWishlisted ? 0 : 1.75}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}