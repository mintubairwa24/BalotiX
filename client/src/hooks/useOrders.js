/**
 * src/hooks/useOrders.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Order-history-specific React Query hooks. Distinct from Phase 12's
 * checkout flow (which only ever needed to CREATE one order) and Phase
 * 13's payment flow (which only needed order details + status) — this
 * phase needs to LIST many orders with pagination and manage
 * cancellation, which are genuinely different data-access patterns
 * deserving their own hook file, even though they call the same
 * underlying order.service.js.
 * 
 * Provides:
 * 1. useOrdersList(page, limit) - paginated order history query
 * 2. useOrderDetails(orderId) - single order query (reused pattern from
 *    Phase 12/13's inline useQuery calls, now centralized here so
 *    OrderDetailsPage doesn't need its own ad-hoc useQuery)
 * 3. useCancelOrder(options) - cancellation mutation
 * 
 * CACHE STRATEGY:
 * - Orders list is keyed by page: ["orders", { page, limit }] so
 *   different pages cache independently and back/forward navigation
 *   between pages doesn't require a refetch
 * - Cancelling an order invalidates BOTH the list and that specific
 *   order's detail query, so the status updates everywhere immediately
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as orderService from "../services/order.service";

/**
 * Fetch a paginated page of the user's order history
 * 
 * @param {number} page - 1-indexed page number
 * @param {number} limit - orders per page (default 10)
 * @returns {Object} { data: { orders, pagination }, isLoading, isError, error }
 * 
 * USAGE:
 * const { data, isLoading } = useOrdersList(currentPage, 10);
 * const orders = data?.orders ?? [];
 * const pagination = data?.pagination;
 */
export const useOrdersList = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["orders", { page, limit }],
    queryFn: async () => {
      const response = await orderService.getOrders({ page, limit });
      return response.data.data; // { orders, pagination }
    },
    staleTime: 0,
    retry: 1,
    // Keep previous page's data visible while fetching the next page,
    // avoiding a jarring skeleton flash on every pagination click
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Fetch full details for a single order
 * 
 * @param {string} orderId
 * @returns {Object} { data: order, isLoading, isError, error, refetch }
 * 
 * USAGE:
 * const { data: order, isLoading } = useOrderDetails(orderId);
 * 
 * Used by OrderDetailsPage as the single source of order data for the
 * items/address/payment/timeline/summary components.
 */
export const useOrderDetails = (orderId) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await orderService.getOrderById(orderId);
      return response.data.data.order ?? response.data.data;
    },
    enabled: !!orderId,
    staleTime: 0,
  });
};

/**
 * Cancel an order
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: cancelOrder, isPending } = useCancelOrder({
 *   onSuccess: () => closeCancelModal()
 * });
 * cancelOrder(orderId);
 * 
 * AFTER SUCCESS:
 * - ["orders"] (all pages) and ["order", orderId] invalidated
 * - OrderDetailsPage re-renders with status: "cancelled"
 * - OrdersList re-renders with updated badge on that order's card
 * 
 * ERRORS:
 * - 400: Backend rejects cancellation for the order's current status
 *   (e.g. already shipped) — surfaced via toast with backend's message
 */
export const useCancelOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId) => orderService.cancelOrder(orderId),
    onSuccess: (response, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });

      toast.success("Order cancelled");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to cancel order";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};