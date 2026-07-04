/**
 * src/components/layout/Header/CartIcon.jsx
 *
 * PURPOSE:
 *   Cart icon button with an animated item count badge.
 *   Reads itemCount from cart.store.js (set by cart mutations).
 *   Navigates to /cart on click.
 */

import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../../store/cart.store";

export function CartIcon() {
  const { itemCount } = useCartStore();

  return (
    <Link
      to="/cart"
      className="relative w-9 h-9 rounded-xl flex items-center justify-center theme-text hover:text-[var(--app-fg)] hover:border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
    >
      <ShoppingCart size={20} />

      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
            aria-hidden="true"
          >
            {itemCount > 99 ? "99+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
