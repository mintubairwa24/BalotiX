/**
 * src/components/payment/PaymentSummary/PaymentSummary.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Shows what the user is about to pay for: order number, item count,
 * and the exact amount payable — all sourced from the Order document
 * (Phase 12's order.service.js -> getOrderById), not recalculated here.
 * 
 * WHY THIS IS SEPARATE FROM CheckoutSummary (Phase 12):
 * CheckoutSummary reads live `cart` totals (subtotal/discount/total)
 * before the order exists. By the time PaymentPage renders, the order
 * has already been created and the cart has been consumed by the
 * backend (Phase 12 flow) — so this component reads the immutable
 * ORDER snapshot instead (order.total, order.orderNumber), which is
 * the correct source of truth at this stage of the funnel. Reusing
 * CheckoutSummary here would require passing it a cart-shaped object
 * that no longer exists, so a small dedicated component is clearer than
 * forcing an ill-fitting reuse.
 * 
 * Props:
 * - order: Order object from getOrderById (Phase 12 order.service.js)
 *   { orderNumber, items, total, appliedCoupon }
 */

export const PaymentSummary = ({ order, items = [] }) => {
  if (!order) return null;

  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const amountPayable = order.totalAmount ?? order.total ?? 0;
  const itemCount = items.length || order.items?.length || 0;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Order Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Order Number</span>
          <span className="font-mono text-gray-900 dark:text-white">
            {order.orderNumber || order._id}
          </span>
        </div>

        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Items</span>
          <span>{itemCount}</span>
        </div>

        {order.appliedCoupon && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>Coupon ({order.appliedCoupon.code})</span>
            <span>-{formatPrice(order.appliedCoupon.discountAmount)}</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <div className="space-y-3">
            {items.map((item) => {
              const unitPrice =
                item.productPriceSnapshot ?? item.effectivePrice ?? 0;
              const lineTotal =
                item.lineTotal ?? item.total ?? unitPrice * Number(item.quantity || 0);
              const image = item.productImageSnapshot || item.image;
              const name =
                item.productNameSnapshot || item.name || item.product?.name || "Product";

              return (
                <div
                  key={item._id || item.productId}
                  className="flex gap-3 items-center"
                >
                  <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {image ? (
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity} × {formatPrice(unitPrice)}
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatPrice(lineTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2" />

        <div className="flex justify-between text-base font-semibold text-gray-900 dark:text-white">
          <span>Amount Payable</span>
          <span>{formatPrice(amountPayable)}</span>
        </div>
      </div>
    </div>
  );
};