/**
 * admin.service.js
 *
 * WHY THIS FILE EXISTS:
 *   The Admin module is an orchestration layer, not a data model. Its job is
 *   to compose existing domain services into a single privileged surface for
 *   the back office. It should not create its own model, and it should not
 *   duplicate business logic that already lives in User, Product, Order,
 *   Inventory, Coupon, Review, or Payment.
 *
 * WHY THE ADMIN MODULE CALLS DOMAIN SERVICES:
 *   Reusing the domain services keeps the admin APIs aligned with the same
 *   business rules the customer-facing APIs already use. That means one place
 *   to validate lifecycle transitions, one place to update derived fields,
 *   and one place to maintain audit behavior.
 *
 * SCALABILITY NOTE:
 *   This file is intentionally thin. As the store grows, the admin layer can
 *   continue to add orchestration flows here without forcing each domain
 *   module to know about every other module's administrative needs.
 */

import * as userService from "../../users/services/user.service.js";
import * as productService from "../../products/services/product.service.js";
import * as orderService from "../../orders/services/order.service.js";
import * as inventoryService from "../../inventory/services/inventory.service.js";
import * as couponService from "../../coupons/services/coupon.service.js";
import * as reviewService from "../../reviews/services/review.service.js";
import * as paymentService from "../../payments/services/payment.service.js";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const getUsers = async (query) => userService.getAllUsers(query);

export const getUserById = async (userId) => userService.getUserById(userId);

export const blockUser = async (userId, adminId) =>
  userService.blockUser(userId, adminId);

export const unblockUser = async (userId, adminId) =>
  userService.unblockUser(userId, adminId);

export const deactivateUser = async (userId, adminId) =>
  userService.deactivateUser(userId, adminId);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const getProducts = async (query) => productService.getAllProducts(query);

export const getProductById = async (productId) =>
  productService.getProductById(productId);

export const createProduct = async (payload, adminId) =>
  productService.createProduct(payload, adminId);

export const updateProduct = async (productId, payload, adminId) =>
  productService.updateProduct(productId, payload, adminId);

export const activateProduct = async (productId, adminId) =>
  productService.updateProductStatus(productId, "active", adminId);

export const archiveProduct = async (productId, adminId) =>
  productService.archiveProduct(productId, adminId);

export const deleteProduct = async (productId, adminId) =>
  productService.archiveProduct(productId, adminId);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const getOrders = async (query) => orderService.getAllOrders(query);

export const getOrderById = async (orderId, adminId) =>
  orderService.getOrderById(orderId, adminId, true);

export const updateOrderStatus = async (orderId, status, adminId) =>
  orderService.updateOrderStatus(orderId, status, adminId);

export const cancelOrder = async (orderId, adminId) =>
  orderService.updateOrderStatus(orderId, "cancelled", adminId);

export const refundOrder = async (orderId, adminId, reason = "") => {
  const { order } = await orderService.getOrderById(orderId, adminId, true);

  if (order.status === "cancelled" || order.status === "refunded") {
    const error = new Error(
      `Orders in "${order.status}" status cannot be refunded again`
    );
    error.statusCode = 400;
    throw error;
  }

  // Refund the payment first so the financial reversal succeeds before we
  // mark the order as refunded. The order status update is intentionally the
  // last step, because it is the state the admin dashboard will show.
  const payment = await paymentService.refundOrderPayment(
    orderId,
    undefined,
    reason,
    adminId
  );

  const updatedOrder = await orderService.updateOrderStatus(
    orderId,
    "refunded",
    adminId
  );

  return { order: updatedOrder, payment };
};

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const getInventory = async (query) =>
  inventoryService.getAllInventory(query);

export const getLowStockReport = async (query) =>
  inventoryService.getLowStockReport(query);

export const adjustInventory = async (productId, quantity, note, adminId) =>
  inventoryService.adjustStock(productId, quantity, note, adminId);

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export const getCoupons = async (query) => couponService.getAllCoupons(query);

export const createCoupon = async (payload, adminId) =>
  couponService.createCoupon(payload, adminId);

export const enableCoupon = async (couponId, adminId) =>
  couponService.activateCoupon(couponId, adminId);

export const disableCoupon = async (couponId, adminId) =>
  couponService.deactivateCoupon(couponId, adminId);

export const getCouponUsage = async (couponId, query) =>
  couponService.getCouponUsage(couponId, query);

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const getReviews = async (query) => reviewService.getAllReviews(query);

export const getReviewById = async (reviewId) =>
  reviewService.getReviewByIdAdmin(reviewId);

export const hideReview = async (reviewId, adminId) =>
  reviewService.hideReview(reviewId, adminId);

export const restoreReview = async (reviewId, adminId) =>
  reviewService.restoreReview(reviewId, adminId);

export const deleteReview = async (reviewId, adminId) =>
  reviewService.deleteReviewByAdmin(reviewId, adminId);
