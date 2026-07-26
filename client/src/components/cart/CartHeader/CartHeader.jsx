/**
 * src/components/cart/CartHeader/CartHeader.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Header section of CartPage showing title and item count
 * Provides "Continue Shopping" navigation back to products
 * 
 * USAGE:
 * <CartHeader itemCount={5} onContinue={() => navigate("/")} />
 */

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CartHeader = ({ itemCount = 0, onContinue }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Title and Count */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Shopping Cart
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {itemCount === 0
            ? "Your cart is empty"
            : `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`}
        </p>
      </div>

      {/* Continue Shopping Button */}
      <button
        onClick={handleContinue}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Continue Shopping
      </button>
    </div>
  );
};