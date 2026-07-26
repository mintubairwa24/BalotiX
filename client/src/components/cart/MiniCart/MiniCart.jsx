/**
 * src/components/cart/MiniCart/MiniCart.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Dropdown cart preview that appears in header
 * Shows recent items, cart count, quick link to CartPage
 * Integrated with useCartStore for open/close state
 * 
 * USAGE IN HEADER:
 * import { MiniCart } from "../cart/MiniCart";
 * 
 * export const Header = () => {
 *   return (
 *     <>
 *       <button onClick={toggleMiniCart}>Cart ({itemCount})</button>
 *       <MiniCart />
 *     </>
 *   );
 * };
 * 
 * BEHAVIOR:
 * - Opens/closes via useCartStore.toggleMiniCart()
 * - Shows 3 most recent items
 * - Overflow scrollable if >3 items
 * - "View Full Cart" link navigates to /cart
 * - "Checkout" button if cart.items.length > 0
 * - "Cart Empty" message if cart.items.length === 0
 * 
 * STYLING:
 * - Dropdown positioned below cart icon
 * - Dark mode support
 * - Framer Motion animations
 */

import { motion, AnimatePresence } from "framer-motion";
import { useCartQuery, isCheckoutLocked } from "../../../hooks/useCart";
import { useCartStore } from "../../../store/cart.store";
import { ShoppingCart, ArrowRight, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { CartEmpty } from "../CartEmpty/CartEmpty";
import { CartSkeleton } from "../CartSkeleton/CartSkeleton";
export const MiniCart = () => {
  const navigate = useNavigate();
  const { data: cart, isLoading } = useCartQuery();
  const { isMiniCartOpen, closeMiniCart } = useCartStore();

  const isLocked = isCheckoutLocked(cart);

<<<<<<< HEAD
  // Format price helper (converts paise to rupees)
=======
  // Format price helper
>>>>>>> origin/main
  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Show only first 3 items
  const displayItems = cart?.items?.slice(0, 3) || [];
  const hasMoreItems = (cart?.items?.length || 0) > 3;
  const totalItems = cart?.itemCount || 0;

  const handleViewCart = () => {
    closeMiniCart();
    navigate("/cart");
  };

  const handleCheckout = () => {
    closeMiniCart();
    navigate("/cart"); // CartPage will have the checkout button
  };

  return (
    <AnimatePresence>
      {isMiniCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMiniCart}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
          />

          {/* Dropdown Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 max-w-[calc(100vw-16px)] bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-40 overflow-hidden max-h-96 md:max-h-96 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Your Cart
                </h3>
              </div>
              <button
                onClick={closeMiniCart}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4">
                  <CartSkeleton count={2} />
                </div>
              ) : displayItems.length === 0 ? (
                <div className="p-6">
                  <CartEmpty onBrowse={closeMiniCart} />
                </div>
              ) : (
                <div className="p-4 space-y-3">
<<<<<<< HEAD
                  {displayItems.map((item) => {
                    // Backend returns populated productId object
                    const product = item.productId || {};
                    const name = product.name || item.nameSnapshot || "Unknown Product";
                    const image = product.thumbnail || "/placeholder-image.png";
                    const price = item.priceSnapshot || 0;
                    return (
                      <div
                        key={item._id || product._id}
                        className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        {/* Product Image */}
                        <img
                          src={image}
                          alt={name}
                          className="h-16 w-16 object-cover rounded"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            x{item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {formatPrice(Number(price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
=======
                  {displayItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      {/* Product Image */}
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="h-16 w-16 object-cover rounded"
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          x{item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {formatPrice(Number(item.effectivePrice) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
>>>>>>> origin/main

                  {/* More Items Indicator */}
                  {hasMoreItems && (
                    <div className="text-center text-xs text-gray-600 dark:text-gray-400 py-2">
                      +{cart.itemCount - 3} more item
                      {cart.itemCount - 3 !== 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Checkout Lock Warning */}
                  {isLocked && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-900/20 rounded">
                      ⚠️ Checkout in progress
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Summary and CTAs */}
            {displayItems.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 shrink-0">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">
                    Total ({totalItems} items)
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(cart.total)}
                  </span>
                </div>

                {/* Buttons */}
                <button
                  onClick={handleViewCart}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded font-medium transition-colors"
                >
                  View Cart
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleCheckout}
                  disabled={isLocked}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                >
                  {isLocked ? "Checkout Locked" : "Checkout"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};