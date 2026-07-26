/**
 * src/pages/orders/OrdersPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Order history list page at route /orders. Shows every order the
 * current user has placed, paginated, newest first (backend-ordered).
 * 
 * RESPONSIBILITIES:
 * 1. Fetch the current page of orders (useOrdersList, this phase)
 * 2. Handle loading/error/empty states
 * 3. Delegate rendering to OrdersList (this phase), which composes
 *    OrderCard + pagination controls
 * 4. Sync pagination with orders.store's currentPage so navigating
 *    back to this page (e.g. from OrderDetailsPage) could later be
 *    extended to remember the page — kept in Zustand rather than local
 *    component state for that reason, even though today it resets on
 *    unmount (see orders.store.js comments)
 * 
 * BACKEND INTEGRATION:
 * - GET /orders?page=&limit= (order.service.js getOrders, this phase)
 * 
 * REUSE:
 * - OrderSkeleton (variant="list") for loading
 * - OrderEmpty for zero orders
 * - OrdersList for the populated state
 */

import { AlertCircle } from "lucide-react";
import { useOrdersList } from "../../hooks/useOrders";
import { useOrdersStore } from "../../store/orders.store";
import { OrdersList, OrderEmpty, OrderSkeleton } from "../../components/orders";

const PAGE_SIZE = 10;

export const OrdersPage = () => {
  const { currentPage, setCurrentPage } = useOrdersStore();

  const { data, isLoading, isError, error } = useOrdersList(
    currentPage,
    PAGE_SIZE
  );

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and review your past orders
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <OrderSkeleton variant="list" count={4} />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Failed to load orders
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                {error?.message || "Something went wrong"}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg">
            <OrderEmpty />
          </div>
        )}

        {/* Populated State */}
        {!isLoading && !isError && orders.length > 0 && (
          <OrdersList
            orders={orders}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};