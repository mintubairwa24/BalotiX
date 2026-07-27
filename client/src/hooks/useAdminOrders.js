/**
 * src/hooks/useAdminOrders.js
 *
 * ARCHITECTURAL PURPOSE:
 * React Query boundary between pure-Axios service files and the Orders UI.
 * Owns cache keys, response unwrapping, and derives query params from
 * adminOrders.store.js so components never assemble query params manually.
 *
 * BACKEND COMMUNICATION:
 * - useAdminOrdersList() → order.service.js#getOrders(params)
 *   → GET /api/orders?page=&limit=&status=&paymentStatus=&search=&sortBy=&sortOrder=
 * - useAdminOrderDetail(id) → order.service.js#getOrderById(id)
 *   → GET /api/orders/:id
 * - useUpdateOrderStatus() → order.service.js#updateOrderStatus(id, status)
 *   → PATCH /api/orders/:id/status { status }
 *
 * BACKEND CONTRACT (orders module):
 *   GET /api/orders (admin) — returns { orders, pagination }
 *   POST /api/orders (customer) — creates order from cart
 *   GET /api/orders/:id — returns { order, items }
 *   PATCH /api/orders/:id/status — returns { _id, orderNumber, status, paymentStatus, updatedAt }
 *
 * PRODUCTION-READY BECAUSE:
 * - Components never see Axios or raw error objects
 * - keepPreviousData avoids skeleton flash on page/filter changes
 * - Mutations invalidate the list cache on success
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { getOrders, getOrderById, updateOrderStatus } from "../services/order.service";
import { useAdminOrdersStore } from "../store/adminOrders.store";

const ORDERS_QUERY_KEY = ["admin", "orders"];

/**
 * Fetches admin orders list using current store state.
 * Store values (search/filter/sort/page) are included in the queryKey so
 * React Query automatically refetches whenever they change.
 */
export const useAdminOrdersList = () => {
  const { search, status, paymentStatus, sortBy, sortOrder, page, limit } =
    useAdminOrdersStore();

  const query = useQuery({
    queryKey: [
      ...ORDERS_QUERY_KEY,
      { search, status, paymentStatus, sortBy, sortOrder, page, limit },
    ],
    queryFn: async () => {
      const response = await getOrders({
        search: search || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      const data = response.data.data;
      return {
        orders: data?.orders ?? [],
        pagination: data?.pagination
          ? {
              ...data.pagination,
              page: data.pagination.currentPage ?? data.pagination.page,
            }
          : null,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  return {
    orders: query.data?.orders ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches full order detail by ID — includes items array.
 * Used by OrderDetailsPage.
 */
export const useAdminOrderDetail = (orderId) => {
  const query = useQuery({
    queryKey: [...ORDERS_QUERY_KEY, "detail", orderId],
    queryFn: async () => {
      const response = await getOrderById(orderId);
      return response.data.data;
    },
    enabled: Boolean(orderId),
    staleTime: 60 * 1000,
  });

  return {
    order: query.data?.order ?? null,
    items: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Updates order status, then invalidates the list and detail caches.
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: (_data, variables) => {
      // Invalidate both the list (any page) and the specific detail
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ORDERS_QUERY_KEY, "detail", variables.orderId],
      });
    },
  });
};

