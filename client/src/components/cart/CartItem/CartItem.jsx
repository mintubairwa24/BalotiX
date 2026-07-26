/**
 * src/components/cart/CartItem/CartItem.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Renders a single line item in the cart
 * Handles quantity updates, removals, and checkout lock state
 * 
 * PROPS:
 * - item: { productId, productName, productImage, effectivePrice, quantity }
 * - isLocked: boolean (cart.status === "checkout_in_progress")
 * - onUpdateQuantity: (productId, newQuantity) => void
 * - onRemove: (productId) => void
 * - isPending: boolean (mutation in progress)
 * 
 * CHECKOUT LOCK BEHAVIOR:
 * When isLocked = true:
 * - Quantity input DISABLED
 * - +/- buttons DISABLED
 * - Remove button DISABLED
 * - Show tooltip: "You can't modify cart during checkout"
 * 
 * This respects the backend lock state without reimplementing it.
 * 
 * PRICE HANDLING:
 * - Receive effectivePrice (the sale price after any discount)
 * - Always in PAISE
 * - Display: ₹${Number(paise).toLocaleString("en-IN")}
 * - Never perform arithmetic on prices
 */

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export const CartItem = ({
  item,
  isLocked = false,
  onUpdateQuantity,
  onRemove,
  isPending = false,
}) => {
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

// Backend sends productId as a populated object (full product document).
// Extract fields from the populated object, falling back to snapshots
// if the product can't be resolved (e.g. deleted after item was added).
const product = item.productId || {};
const productId = product._id || item.productId || item._id;
const productName = product.name || item.nameSnapshot || "Unknown Product";
const productImage = product.thumbnail || "/placeholder-image.png";
const quantity = item.quantity || 1;
// Use priceSnapshot (captured at add-time) for display consistency.
const effectivePrice = item.priceSnapshot || 0;

  // Format price for display (paise to rupees)
  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Calculate line total (paise)
  const lineTotal = Number(effectivePrice) * quantity;

  const handleIncreaseQty = () => {
    if (!isLocked && !isPending) {
      onUpdateQuantity(productId, quantity + 1);
    }
  };

  const handleDecreaseQty = () => {
    if (!isLocked && !isPending) {
      if (quantity > 1) {
        onUpdateQuantity(productId, quantity - 1);
      }
    }
  };

  const handleQuantityChange = (e) => {
    if (!isLocked && !isPending) {
      const newQty = parseInt(e.target.value, 10) || 1;
      if (newQty > 0) {
        onUpdateQuantity(productId, newQty);
      }
    }
  };

  const handleRemove = () => {
    if (!isLocked && !isPending) {
      onRemove(productId);
      setShowRemoveConfirm(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-4 py-4 border-b border-gray-200 dark:border-gray-700 ${
        isPending ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={productImage}
          alt={productName}
          className="h-24 w-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1">
        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
          {productName}
        </h3>

        {/* Price */}
        <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">
          {formatPrice(effectivePrice)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDecreaseQty}
            disabled={isLocked || isPending || quantity <= 1}
            className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isLocked ? "Locked during checkout" : "Decrease quantity"}
          >
            <Minus size={16} />
          </button>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isLocked || isPending}
            className="w-12 text-center border border-gray-300 dark:border-gray-600 rounded py-1 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
            title={isLocked ? "Locked during checkout" : "Edit quantity"}
          />

          <button
            onClick={handleIncreaseQty}
            disabled={isLocked || isPending}
            className="p-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isLocked ? "Locked during checkout" : "Increase quantity"}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Checkout Lock Warning */}
        {isLocked && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            ⚠️ Locked during checkout
          </p>
        )}
      </div>

      {/* Line Total & Remove */}
      <div className="flex flex-col items-end justify-between">
        {/* Line Total */}
        <div className="text-right">
          <p className="text-xs text-gray-600 dark:text-gray-400">Subtotal</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {/* Remove Button */}
        {!showRemoveConfirm ? (
          <button
            onClick={() => setShowRemoveConfirm(true)}
            disabled={isLocked || isPending}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isLocked ? "Locked during checkout" : "Remove from cart"}
          >
            <Trash2 size={18} />
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={handleRemove}
              disabled={isPending}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              Yes
            </button>
            <button
              onClick={() => setShowRemoveConfirm(false)}
              disabled={isPending}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              No
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};