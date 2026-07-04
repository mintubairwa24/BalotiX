/**
 * src/components/layout/Header/WishlistIcon.jsx
 *
 * PURPOSE:
 *   Wishlist icon button with item count badge.
 *   Reads itemCount from wishlist.store.js.
 */

import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "../../../store/wishlist.store";

export function WishlistIcon() {
  const { itemCount } = useWishlistStore();

  return (
    <Link
      to="/account/wishlist"
      className="relative w-9 h-9 rounded-xl flex items-center justify-center theme-text-muted hover:text-[var(--app-fg)] hover:bg-[var(--app-surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={`Wishlist — ${itemCount} saved item${itemCount !== 1 ? "s" : ""}`}
    >
      <Heart size={20} />

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
            aria-hidden="true"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
