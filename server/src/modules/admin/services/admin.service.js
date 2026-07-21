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
import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const getUsers = async (query) => {
  const result = await userService.getAllUsers(query);

  // The client-side components strictly check for `status === "active"`.
  // The data from the user service might have a status field with different casing
  // (e.g., a boolean `isBlocked` field). This transformation normalizes the
  // underlying data into the consistent `status: "active" | "suspended"`
  // string the client-side components expect.
  const usersWithStatus = result.users.map((user) => {
    const userObj = user.toObject ? user.toObject() : user;
    // The user model uses a boolean `isBlocked` field. `isBlocked: true` maps
    // to "suspended", and `isBlocked: false` (or undefined) maps to "active".
    const finalStatus = userObj.isBlocked ? "suspended" : "active";
    return { ...userObj, status: finalStatus };
  });

  return { ...result, users: usersWithStatus };
};

export const getUserById = async (userId) => {
  // Add validation to fail fast if the provided ID is not a valid MongoDB ObjectId.
  // This prevents deeper errors and provides a clearer response for bad requests.
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    const error = new Error("Invalid user ID format");
    error.statusCode = 400;
    throw error;
  }

  // The client's user detail page requires a comprehensive data object. This
  // function previously failed because it assumed auxiliary service functions
  // (like `getUserAddresses`) existed and would succeed. If a function was
  // missing from the imported service, it would cause a `TypeError` before
  // any promises could be executed, causing the entire request to fail.
  //
  // This implementation is now fully resilient. It defensively checks for the
  // existence of each optional service function. If a function doesn't exist,
  // it provides a resolved promise with a safe default value (e.g., an empty
  // array). This prevents runtime errors and ensures the essential user
  // profile can be loaded even if the auxiliary data services are not yet
  // implemented.
  const userPromise =
    typeof userService?.getUserById === "function"
      ? userService.getUserById(userId)
      : Promise.reject(
          new Error("User service is not configured correctly to fetch users.")
        );
  const addressesPromise =
    typeof userService?.getUserAddresses === "function"
      ? userService.getUserAddresses(userId)
      : Promise.resolve([]);
  const orderSummaryPromise =
    typeof orderService?.getSummaryForUser === "function"
      ? orderService.getSummaryForUser(userId)
      : Promise.resolve(null);
  const activityPromise =
    typeof userService?.getUserActivity === "function"
      ? userService.getUserActivity(userId)
      : Promise.resolve([]);

  const results = await Promise.allSettled([
    userPromise,
    addressesPromise,
    orderSummaryPromise,
    activityPromise,
  ]);

  const [userResult, addressesResult, orderSummaryResult, activityResult] = results;

  if (userResult.status === "rejected" || !userResult.value) {
    const error = new Error("User not found");
    error.statusCode = 404;
    if (userResult.reason) console.error("Failed to fetch user:", userResult.reason);
    throw error;
  }

  const user = userResult.value;

  // Gracefully handle failures for auxiliary data, providing defaults.
  const addresses = addressesResult.status === 'fulfilled' ? addressesResult.value : [];
  const orderSummary = orderSummaryResult.status === 'fulfilled' ? orderSummaryResult.value : null;
  const activity = activityResult.status === 'fulfilled' ? activityResult.value : [];

  // Log errors for failed sub-queries for debugging, without crashing the request.
  if (addressesResult.status === 'rejected') console.error("Failed to fetch user addresses:", addressesResult.reason);
  if (orderSummaryResult.status === 'rejected') console.error("Failed to fetch user order summary:", orderSummaryResult.reason);
  if (activityResult.status === 'rejected') console.error("Failed to fetch user activity:", activityResult.reason);

  // As with `getUsers`, we normalize the status field for the detailed user view
  // to ensure consistency with the client's expectations.
  const userObj = user.toObject ? user.toObject() : user;
  // The user model uses a boolean `isBlocked` field, which we map to the
  // "active" or "suspended" status string required by the client.
  const finalStatus = userObj.isBlocked ? "suspended" : "active";
  const userWithStatus = { ...userObj, status: finalStatus };

  return { user: userWithStatus, addresses, orderSummary, activity };
};

export const blockUser = async (userId, adminId) => {
  // This function was previously calling a non-existent `userService.blockUser`.
  // It's corrected to use the generic `updateUser` function with the payload
  // that corresponds to blocking a user (`isBlocked: true`).
  return userService.updateUser(userId, { isBlocked: true }, adminId);
};

export const unblockUser = async (userId, adminId) => {
  // This function was previously calling a non-existent `userService.unblockUser`.
  // It's corrected to use the generic `updateUser` function with the payload
  // that corresponds to unblocking a user (`isBlocked: false`).
  return userService.updateUser(userId, { isBlocked: false }, adminId);
};

export const deactivateUser = async (userId, adminId) =>
  userService.deactivateUser(userId, adminId);

/**
 * Updates a user's profile details as an admin.
 * This is the logic for the PATCH /admin/users/:id route.
 * @param {string} userId - The ID of the user to update.
 * @param {object} payload - The data to update (e.g., { name, phone }).
 * @param {string} adminId - The ID of the admin performing the action for auditing.
 */
export const updateUserByAdmin = async (userId, payload, adminId) => {
  // This assumes a generic `updateUser` function exists on the user service
  // that can be called by an admin.
  return userService.updateUser(userId, payload, adminId);
};

/**
 * Updates a user's status based on a string value ("active" or "suspended").
 * This provides a single entry point for a controller to call, which then maps
 * to the more specific block/unblock service functions. This is the logic
 * the missing PATCH /admin/users/:id/status route should call.
 * @param {string} userId - The ID of the user to update.
 * @param {'active' | 'suspended'} status - The desired new status.
 * @param {string} adminId - The ID of the admin performing the action.
 */
export const updateUserStatus = async (userId, status, adminId) => {
  if (status === "active") {
    return unblockUser(userId, adminId);
  } else if (status === "suspended") {
    return blockUser(userId, adminId);
  }
  const error = new Error(`Invalid status update: "${status}"`);
  error.statusCode = 400;
  throw error;
};

/**
 * Changes a user's role.
 * This function validates the new role and then calls the underlying user
 * service to perform the update. This is the logic the missing
 * PATCH /admin/users/:id/role route should call.
 * @param {string} userId - The ID of the user to update.
 * @param {'customer' | 'admin'} role - The desired new role.
 * @param {string} adminId - The ID of the admin performing the action.
 */
export const changeUserRole = async (userId, role, adminId) => {
  if (userId.toString() === adminId.toString()) {
    const error = new Error("Admins cannot change their own role.");
    error.statusCode = 403;
    throw error;
  }

  const VALID_ROLES = ["customer", "admin"];
  if (!VALID_ROLES.includes(role)) {
    const error = new Error(`Invalid role specified: "${role}"`);
    error.statusCode = 400;
    throw error;
  }

  // Assumes a `changeRole` function exists on the user service.
  return userService.changeRole(userId, role, adminId);
};

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export const getProducts = async (query) => {
  // This function previously had a faulty mapping that overwrote the real
  // product status ('draft', 'archived') with a simplified 'inactive' status.
  // This broke the admin UI, which needs the true status to function.
  // By removing the mapping and returning the result from the product service
  // directly, the UI will now receive the correct data.
  return productService.getAllProducts(query);
};

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

export const deleteProduct = async (productId, adminId) => {
  // The product service's documentation specifies that `archiveProduct` is the only
  // supported form of deletion to maintain relational integrity with orders. This
  // function was incorrectly calling a non-existent `deleteProduct`.
  return productService.archiveProduct(productId, adminId);
};

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
