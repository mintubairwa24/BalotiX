/**
 * src/components/cart/CartEmpty/CartEmpty.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays when cart.items.length === 0
 * Provides encouraging message and call-to-action to browse products
 * 
 * This component is reused in:
 * - CartPage (full-page empty state)
 * - MiniCart (dropdown empty state)
 * - Future: OrderHistory when no orders
 * 
 * USAGE:
 * <CartEmpty onBrowse={() => navigate("/")} />
 */

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export const CartEmpty = ({ onBrowse }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Empty Icon */}
      <div className="mb-6">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
          <ShoppingCart
            size={48}
            className="text-gray-400 dark:text-gray-600"
          />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Your cart is empty
      </h2>

      {/* Message */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm mb-8">
        Looks like you haven't added anything yet. Browse our collection and
        find something you love!
      </p>

      {/* CTA Button */}
      <Link
        to="/"
        onClick={onBrowse}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Continue Shopping
      </Link>
    </motion.div>
  );
};