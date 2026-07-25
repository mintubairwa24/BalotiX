/**
 * inventory.controller.js
 *
 * Controller for handling admin inventory-related HTTP requests.
 */

import * as inventoryService from "../../inventory/services/inventory.service.js";

export const getInventoryList = async (req, res, next) => {
  try {
    // TODO: Add Zod validation for req.query
    const result = await inventoryService.getAdminInventory(req.query);
    res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await inventoryService.getInventoryDetailsWithHistory(id);
    res.status(200).json({
      success: true,
      message: "Inventory details fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newQuantity, reason } = req.body; // TODO: Add Zod validation
    const adminId = req.user._id;

    const result = await inventoryService.updateInventoryStock(id, newQuantity, reason, adminId);
    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};