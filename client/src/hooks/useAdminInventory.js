/**
 * FILE: src/hooks/useAdminInventory.js
 *
 * ============================================================================
 * useAdminInventory — Phase 18F (Admin Inventory Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The React Query boundary between the pure-Axios service files
 * (admin.service.js, inventory.service.js) and the Inventory UI. Owns
 * cache keys, response unwrapping, and derives the list query's params
 * straight from adminInventory.store.js — exact sibling of
 * useAdminCoupons.js/useAdminProducts.js.
 *
 * BACKEND COMMUNICATION:
 * - useAdminInventoryList() → admin.service.js#getAdminInventory(params)
 *   → GET /inventory?page=&limit=&search=&status=&sortBy=&sortOrder=
 * - useAdminInventoryDetail(productId) → admin.service.js#getAdminInventoryDetail
 *   → GET /inventory/:productId
 * - useAdjustStock() → inventory.service.js#adjustStock(productId, adjustment)
 *   → POST/patch to the inventory adjustment endpoint used by the service
 * - useStockHistory(productId) → inventory.service.js#getStockHistory
 *   → GET /inventory/:productId/movements
 *
 * WHY THE LIST QUERY READS THE STORE DIRECTLY:
 * Same reasoning as every sibling admin list hook — adminInventory.store.js
 * is the single source of truth for "what is the admin currently looking
 * at," and every value read from it is included in the queryKey so React
 * Query auto-refetches on any search/filter/sort/page change.
 *
 * WHY useAdjustStock INVALIDATES THREE QUERY FAMILIES:
 * A stock adjustment changes: (1) the LIST (the row's stock/status
 * change), (2) that product's DETAIL (if InventoryDetailsPage is open),
 * and (3) that product's HISTORY (a new movement was just recorded, if
 * the history endpoint exists). Invalidating all three ensures whichever
 * screens happen to be mounted reflect the adjustment immediately,
 * without each screen needing its own manual refetch() call.
 *
 * WHY useStockHistory HAS `retry: false`:
 * Same reasoning as Phase 18D's useAdminCategoryTree — this endpoint's
 * existence isn't confirmed, so retrying a possibly-404 request three
 * times before StockHistory.jsx can show its graceful "unavailable" state
 * would just add latency to an already-uncertain feature.
 *
 * PRODUCTION-READY BECAUSE:
 * - Components never see Axios or raw error objects — only
 *   { data, isLoading, isError, mutate, isPending }
 * - `placeholderData: keepPreviousData` avoids a skeleton flash between
 *   page/filter changes on the list
 * - Detail and history queries are disabled (`enabled: Boolean(productId)`)
 *   until a real id is available
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { adjustStock, getStockHistory } from "../services/inventory.service";
import {
  getAdminInventory,
  getAdminInventoryDetail,
} from "../services/admin.service";
import { useAdminInventoryStore } from "../store/adminInventory.store";

const INVENTORY_QUERY_KEY = ["admin", "inventory"];
const inventoryDetailKey = (productId) => ["admin", "inventory", "detail", productId];
const stockHistoryKey = (productId) => ["admin", "inventory", "history", productId];

/**
 * Fetches the admin inventory list using the current search/filter/sort/
 * page state from adminInventory.store.js. No params needed.
 */
export const useAdminInventoryList = () => {
  const { search, status, sortBy, sortOrder, page, limit } = useAdminInventoryStore();

  const query = useQuery({
    queryKey: [...INVENTORY_QUERY_KEY, { search, status, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const response = await getAdminInventory({
        search: search || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      const data = response.data.data;
      return {
        ...data,
        pagination: data?.pagination
          ? {
              ...data.pagination,
              page: data.pagination.currentPage ?? data.pagination.page,
            }
          : data?.pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    summary: query.data?.summary,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/** Fetches full admin detail for one product's inventory record. */
export const useAdminInventoryDetail = (productId) => {
  const query = useQuery({
    queryKey: inventoryDetailKey(productId),
    queryFn: async () => {
      const response = await getAdminInventoryDetail(productId);
      return response.data.data.inventory;
    },
    enabled: Boolean(productId),
    staleTime: 30 * 1000,
  });

  return {
    item: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches stock movement history for one product. FLAGGED — see
 * inventory.service.js's header; StockHistory.jsx handles isError
 * gracefully rather than assuming this always succeeds.
 */
export const useStockHistory = (productId) => {
  const query = useQuery({
    queryKey: stockHistoryKey(productId),
    queryFn: async () => {
      const response = await getStockHistory(productId);
      return response.data.data.movements ?? response.data.data.history ?? [];
    },
    enabled: Boolean(productId),
    staleTime: 30 * 1000,
    retry: false,
  });

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

/**
 * Submits a stock adjustment for one product. Invalidates the list,
 * that product's detail, and its stock history — see file header.
 */
export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, adjustment }) => adjustStock(productId, adjustment),
    onSuccess: (_res, { productId }) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: inventoryDetailKey(productId) });
      queryClient.invalidateQueries({ queryKey: stockHistoryKey(productId) });
    },
  });
};
