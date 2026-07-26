/**
 * src/services/inventory.service.js
 *
 * Service layer for all admin inventory-related API calls.
 */

import api from "../api/axios";

const INVENTORY_ENDPOINTS = {
  LIST: "/admin/inventory",
  DETAILS: (id) => `/admin/inventory/${id}`,
  UPDATE_STOCK: (id) => `/admin/inventory/${id}/stock`,
};

/**
 * GET /admin/inventory — paginated inventory listing with filters.
 * @param {Object} params — { page, limit, status, sortBy, sortOrder, search }
 */
export const getAdminInventory = (params = {}) =>
  api.get(INVENTORY_ENDPOINTS.LIST, { params });

/**
 * GET /admin/inventory/:id — details and history for one inventory item.
 * @param {string} inventoryId
 */
export const getInventoryDetails = (inventoryId) =>
  api.get(INVENTORY_ENDPOINTS.DETAILS(inventoryId));

/**
 * PATCH /admin/inventory/:id/stock — manually adjust stock quantity.
 * @param {string} inventoryId
 * @param {{ newQuantity: number, reason: string }} payload
 */
export const updateStock = (inventoryId, payload) =>
  api.patch(INVENTORY_ENDPOINTS.UPDATE_STOCK(inventoryId), payload);