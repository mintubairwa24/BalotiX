/**
 * src/components/orders/OrdersList/OrdersList.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Container component that renders the paginated list of OrderCards
 * plus pagination controls. Kept separate from OrdersPage so the page
 * itself only handles loading/error/empty routing, while this component
 * owns "how a list of orders + pagination looks."
 * 
 * Pagination follows the same backend-is-source-of-truth principle used
 * throughout NexCart: totalPages/totalOrders come from the API response
 * (order.service.js getOrders), never computed on the frontend.
 * 
 * Props:
 * - orders: array of order summaries
 * - pagination: { page, limit, totalOrders, totalPages }
 * - currentPage: number
 * - onPageChange: callback(page)
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { OrderCard } from "../OrderCard/OrderCard";

export const OrdersList = ({ orders, pagination, currentPage, onPageChange }) => {
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      {/* Pagination — only shown if backend reports more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};