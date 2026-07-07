// src/components/wishlist/WishlistEmpty/WishlistEmpty.jsx
//
// WHY THIS FILE EXISTS:
// Every list in NexCart has a matching Empty component — the empty state is
// just as important as the loaded state for UX. This follows the same pattern
// as ProductEmpty and CategoryEmpty already in the project.
//
// The empty state teaches the user WHAT to do next (browse products) rather
// than just showing "No items" — this is the key UX distinction.
//
// FUTURE MODULES:
// Phase 9  — OrdersPage uses a similar pattern (OrderEmpty)
// Phase 10 — CheckoutPage may deep-link to wishlist as a "saved items" source

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { ROUTES } from "../../../constants/route.constants";

export function WishlistEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      {/* Animated heart icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Heart
            size={40}
            className="text-red-300 dark:text-red-500"
            fill="currentColor"
          />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-semibold text-gray-900 dark:text-white mb-2"
      >
        Your wishlist is empty
      </motion.h2>

      {/* Sub-text */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-gray-500 dark:text-gray-400 max-w-sm mb-8"
      >
        Items you save will appear here. Start exploring and tap the{" "}
        <Heart size={14} className="inline text-red-400" fill="currentColor" />{" "}
        on any product to save it for later.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          to={ROUTES.PRODUCTS}
          className={[
            "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
            "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600",
            "text-white font-medium text-sm",
            "transition-colors duration-200",
            "shadow-sm",
          ].join(" ")}
        >
          <ShoppingBag size={18} />
          Browse Products
        </Link>
      </motion.div>
    </motion.div>
  );
}