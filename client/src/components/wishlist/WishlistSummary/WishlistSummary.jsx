// src/components/wishlist/WishlistSummary/WishlistSummary.jsx
//
// WHY THIS FILE EXISTS:
// Provides the page-level heading for WishlistPage.
// Reading itemCount directly from Zustand (instead of props) means the
// count updates INSTANTLY on optimistic remove — before the server responds.
// This is intentional: the user sees "4 items" drop to "3 items" the moment
// they click Remove, not 300ms later when the query refetches.
//
// FUTURE MODULES:
// Phase 9  — AccountPage uses the same "Section heading + count" pattern
// Phase 10 — CheckoutPage summary header uses a similar layout

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useWishlistStore } from "../../../store/wishlist.store";

export function WishlistSummary() {
  // Direct Zustand selector — granular re-render on itemCount change only
  const itemCount = useWishlistStore((state) => state.itemCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-between flex-wrap gap-4 mb-8"
    >
      {/* Heading */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20">
          <Heart
            size={20}
            className="text-red-500 dark:text-red-400"
            fill="currentColor"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            My Wishlist
          </h1>
          {/* Live count — updates optimistically */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {itemCount === 0
              ? "No items saved"
              : itemCount === 1
              ? "1 item saved"
              : `${itemCount} items saved`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}