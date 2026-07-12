/**
 * src/components/orders/OrderItems/OrderItems.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Read-only display of the products in an order, for OrderDetailsPage.
 * 
 * RELATIONSHIP TO CheckoutItems (Phase 12):
 * This component is intentionally the same shape as
 * src/components/checkout/CheckoutItems.jsx — both render a read-only
 * list of { name, image, effectivePrice, quantity, lineTotal }. It is
 * NOT imported from the checkout module, though, because:
 * 1. Cross-feature imports between checkout/ and orders/ create a
 *    layering dependency in the wrong direction (orders should not
 *    depend on checkout, which is a "in-progress purchase" concept,
 *    while orders represent a completed/historical purchase) — a
 *    future refactor might change CheckoutItems' props for
 *    checkout-specific needs (e.g. edit affordances) without realizing
 *    OrderDetailsPage silently depends on it too.
 * 2. Order items also carry order-specific context (e.g. this data is
 *    a permanent historical snapshot vs. checkout's live-cart-derived
 *    data) that may diverge over time — keeping them as siblings rather
 *    than one importing the other keeps that evolution safe.
 * 
 * If your team prefers a single shared "read-only line items" component
 * instead, it would belong in a neutral shared location (e.g.
 * src/components/shared/LineItemsList/) rather than either feature
 * folder importing the other — noted here for future refactoring.
 * 
 * Props:
 * - items: array of order line items (order.items from getOrderById)
 */

export const OrderItems = ({ items = [] }) => {
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
        Items ({items.length})
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.productId || item._id}
            className="flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
          >
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

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Qty: {item.quantity} × {formatPrice(item.effectivePrice)}
              </p>
            </div>

            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatPrice(item.lineTotal ?? item.effectivePrice * item.quantity)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};