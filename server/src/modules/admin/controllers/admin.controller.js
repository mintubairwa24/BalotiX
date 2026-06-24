/**
 * admin.controller.js
 *
 * WHY IT EXISTS:
 *   Controllers are the HTTP translation layer. They know about req/res,
 *   but they do not know how users are blocked, how coupons are enabled, or
 *   how stock is adjusted. All of that stays in the service layer.
 *
 * SECURITY NOTE:
 *   The router already protects every endpoint with requireAuth and
 *   requireRole("admin"). The controller does not repeat that logic; it
 *   simply assumes the middleware chain has already authorized the request.
 */

import * as adminService from "../services/admin.service.js";

export const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getUsers(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const result = await adminService.getUserById(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const profile = await adminService.blockUser(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: "User blocked successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const unblockUser = async (req, res, next) => {
  try {
    const profile = await adminService.unblockUser(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const profile = await adminService.deactivateUser(
      req.params.id,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      data: { profile },
    });
  } catch (error) {
    return next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const result = await adminService.getProducts(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await adminService.getProductById(req.params.id);
    return res.status(200).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await adminService.createProduct(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await adminService.updateProduct(
      req.params.id,
      req.body,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

export const activateProduct = async (req, res, next) => {
  try {
    const product = await adminService.activateProduct(
      req.params.id,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: "Product activated successfully",
      data: { product },
    });
  } catch (error) {
    return next(error);
  }
};

export const archiveProduct = async (req, res, next) => {
  try {
    const result = await adminService.archiveProduct(
      req.params.id,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: result.message,
      data: { _id: result._id },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await adminService.deleteProduct(
      req.params.id,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: result.message,
      data: { _id: result._id },
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const result = await adminService.getOrders(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const result = await adminService.getOrderById(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await adminService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: `Order status updated to "${result.status}"`,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const result = await adminService.cancelOrder(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const refundOrder = async (req, res, next) => {
  try {
    const result = await adminService.refundOrder(
      req.params.id,
      req.user._id,
      req.body.reason || ""
    );
    return res.status(200).json({
      success: true,
      message: "Order refunded successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getInventory = async (req, res, next) => {
  try {
    const result = await adminService.getInventory(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getLowStockReport = async (req, res, next) => {
  try {
    const result = await adminService.getLowStockReport(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const adjustInventory = async (req, res, next) => {
  try {
    const inventory = await adminService.adjustInventory(
      req.params.productId,
      req.body.quantity,
      req.body.note,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: "Inventory adjusted successfully",
      data: { inventory },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const result = await adminService.getCoupons(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await adminService.createCoupon(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: { coupon },
    });
  } catch (error) {
    return next(error);
  }
};

export const enableCoupon = async (req, res, next) => {
  try {
    const result = await adminService.enableCoupon(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: "Coupon enabled successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const disableCoupon = async (req, res, next) => {
  try {
    const result = await adminService.disableCoupon(
      req.params.id,
      req.user._id
    );
    return res.status(200).json({
      success: true,
      message: "Coupon disabled successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getCouponUsage = async (req, res, next) => {
  try {
    const result = await adminService.getCouponUsage(req.params.id, req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const result = await adminService.getReviews(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const review = await adminService.getReviewById(req.params.id);
    return res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    return next(error);
  }
};

export const hideReview = async (req, res, next) => {
  try {
    const review = await adminService.hideReview(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: "Review hidden successfully",
      data: { review },
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreReview = async (req, res, next) => {
  try {
    const review = await adminService.restoreReview(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: "Review restored successfully",
      data: { review },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const result = await adminService.deleteReview(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: result.message,
      data: { _id: result._id },
    });
  } catch (error) {
    return next(error);
  }
};
