/**
 * src/hooks/useAdminInventory.js
 *
 * React Query hooks for fetching and mutating admin inventory data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAdminInventoryStore } from "../store/adminInventory.store";
import * as inventoryService from "../services/inventory.service";

/**
 * Fetches a paginated list of inventory items for the admin panel.
 * Parameters are read from the Zustand store.
 */
export const useAdminInventoryList = () => {
  const params = useAdminInventoryStore((s) => ({
    page: s.page,
    status: s.status,
    search: s.search,
    sortBy: s.sortBy,
    sortOrder: s.sortOrder,
  }));

  return useQuery({
    queryKey: ["adminInventory", params],
    queryFn: () => inventoryService.getAdminInventory(params),
    select: (data) => data.data.data,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 5, // 5 seconds
  });
};

/**
 * Fetches details and stock history for a single inventory item.
 * @param {string} inventoryId
 */
export const useAdminInventoryDetails = (inventoryId) => {
  return useQuery({
    queryKey: ["adminInventory", inventoryId],
    queryFn: () => inventoryService.getInventoryDetails(inventoryId),
    select: (data) => data.data.data,
    enabled: !!inventoryId,
  });
};

/**
 * Provides a mutation function to update the stock of an inventory item.
 * @param {Object} options - { onSuccess, onError } callbacks.
 */
export const useUpdateStock = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, payload }) =>
      inventoryService.updateStock(inventoryId, payload),
    onSuccess: (response, { inventoryId }) => {
      // Invalidate both the list and the specific item's details
      queryClient.invalidateQueries({ queryKey: ["adminInventory"] });
      
      toast.success("Stock updated successfully!");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update stock.";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};