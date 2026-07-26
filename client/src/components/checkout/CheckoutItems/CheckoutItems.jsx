/**
 * src/components/checkout/CheckoutItems/CheckoutItems.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Read-only review of the cart items being purchased. This is
 * intentionally NOT the same as CartList (Phase 9) — that component
 * supports editing quantity/removal, which is NOT appropriate during
 * checkout (cart is locked via checkoutStart at this point).
 * 
 * Rather than reusing CartList (which has edit affordances baked in),
 * this component renders a simplified, non-interactive summary of the
 * same cart.items data — keeping checkout intentionally "read-only".
 * 
 * DATA SOURCE:
 * Receives `items` directly from the cart object (useCartQuery, Phase 9).
 * Does NOT fetch its own data — pure presentational component.
 * 
 * Props:
 * - items: array of cart items (same shape as CartItem consumes)
 *   [{ productId, name, image, effectivePrice, quantity, lineTotal }]
 */

export const CheckoutItems = ({ items = [] }) => {
  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Order Items ({items.length})
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId || item._id}
            className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
          >
            {/* Product Image */}
            <div className="w-16 h-16 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Qty: {item.quantity} × {formatPrice(item.effectivePrice)}
              </p>
            </div>

            {/* Line Total */}
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatPrice(item.lineTotal ?? item.effectivePrice * item.quantity)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};