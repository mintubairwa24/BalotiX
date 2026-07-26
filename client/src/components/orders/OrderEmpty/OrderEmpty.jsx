/**
 * src/components/orders/OrderEmpty/OrderEmpty.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Empty state shown on OrdersPage when the user has placed zero orders.
 * Same pattern as CartEmpty (Phase 9) and AddressEmpty (Phase 11) —
 * friendly message + CTA back into the shopping flow.
 */

import { Package } from "lucide-react";
import { Link } from "react-router-dom";

export const OrderEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
        <Package size={40} className="text-gray-400 dark:text-gray-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No orders yet
      </h3>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-sm mb-6">
        You haven't placed any orders yet. Start shopping to see your
        orders here.
      </p>

      <Link
        to="/"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Start Shopping
      </Link>
    </div>
  );
};