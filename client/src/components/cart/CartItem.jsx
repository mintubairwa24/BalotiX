/**
 * CartItem.jsx
 *
 * Renders a single line item in the shopping cart.
 *
 * BUG FIXES APPLIED:
 *   1. Data Rendering:
 *      - Now accesses `item.productId.name` and `item.productId.thumbnail` for title and image.
 *      - Handles cases where product data might be missing.
 *   2. Calculation & Type Errors (NaN):
 *      - Uses `item.priceSnapshot` for both unit price and subtotal calculation. This is the
 *        price captured at add-time and is the same value the server uses for the final total,
 *        fixing the desync and the `₹NaN` error.
 *   3. UI Disabled State:
 *      - Accepts `isCheckoutInProgress` prop.
 *      - All buttons (+, -, trash) and the quantity input now have a `disabled` attribute
 *        and visual styling tied to this prop.
 */
import React from "react";
import { FaTrash } from "react-icons/fa";
import { useCart } from "../../hooks/useCart";
import { formatCurrency } from "../../utils/CurrencyFormatter";

export const CartItem = ({ item, isLocked }) => {
  const { updateItemQuantity, removeItem, isUpdating } = useCart();

  // Access product data from the nested `productId` object populated by the server.
  const product = item.productId;

  if (!product) {
    // Gracefully handle cases where a product might be missing from the populated data.
    return (
      <li className="p-4 flex items-center justify-between text-red-500">
        <span>This item ({item.nameSnapshot}) is no longer available.</span>
        <button
          onClick={() => removeItem.mutate(item._id)}
          disabled={isLocked || isUpdating}
          className="text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTrash />
        </button>
      </li>
    );
  }

  // Calculate subtotal using the reliable `priceSnapshot` to prevent NaN errors.
  const itemSubtotal = item.priceSnapshot * item.quantity;

  const handleQuantityChange = (newQuantity) => {
    const qty = Math.max(1, parseInt(newQuantity, 10) || 1);
    updateItemQuantity.mutate({ productId: product._id, quantity: qty });
  };

  return (
    <li className="p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <img
        src={product.thumbnail || "/placeholder-image.png"}
        alt={product.name}
        className="w-24 h-24 object-cover rounded-md border"
      />
      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        {/* Display the unit price using `priceSnapshot`. */}
        <p className="text-gray-600">{formatCurrency(item.priceSnapshot)}</p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          // FIX: Disable button when cart is locked.
          disabled={isLocked || isUpdating || item.quantity <= 1}
          className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(e.target.value)}
          onBlur={(e) => handleQuantityChange(e.target.value)}
          min="1"
          // FIX: Disable input when cart is locked.
          disabled={isLocked || isUpdating}
          className="w-16 text-center border rounded-md disabled:opacity-50 disabled:bg-gray-100"
        />
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          // FIX: Disable button when cart is locked.
          disabled={isLocked || isUpdating}
          className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
      <div className="font-semibold text-right w-24">
        {/* Display the calculated item subtotal. */}
        {formatCurrency(itemSubtotal)}
      </div>
      <div className="w-10 text-right">
        <button
          onClick={() => removeItem.mutate(item._id)}
          // FIX: Disable button when cart is locked.
          disabled={isLocked || isUpdating}
          className="text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove item"
        >
          <FaTrash />
        </button>
      </div>
    </li>
  );
};