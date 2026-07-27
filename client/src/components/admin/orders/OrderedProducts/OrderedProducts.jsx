/**
 * COMPONENT: src/components/admin/orders/OrderedProducts/OrderedProducts.jsx
 *
 * PURPOSE:
 * Displays the list of ordered products for an order. Backend returns items[]
 * from GET /api/orders/:id where each item contains:
 *   productId, productNameSnapshot, productPriceSnapshot,
 *   productImageSnapshot, quantity, lineTotal
 *
 * These are immutable snapshots captured at order creation time.
 */

import { Package } from "lucide-react";

const formatCurrency = (amount) =>
  `₹${(amount ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const OrderedProducts = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No items found for this order.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          <Package className="h-4 w-4 text-gray-400" />
          Ordered Products ({items.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {items.map((item, index) => (
          <div
            key={item._id || index}
            className="flex items-center gap-4 px-4 py-3"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
              {item.productImageSnapshot ? (
                <img
                  src={item.productImageSnapshot}
                  alt={item.productNameSnapshot || "Product"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-700">
                  <Package className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.productNameSnapshot || "Unknown Product"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(item.productPriceSnapshot)} × {item.quantity}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(item.lineTotal)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderedProducts;

