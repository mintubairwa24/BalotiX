/**
 * admin.routes.js
 *
 * WHY THIS FILE EXISTS:
 *   It defines the privileged back-office HTTP surface by composing existing
 *   domain services through the admin controller. Every route is protected
 *   by requireAuth + requireRole("admin"), and the router never exposes a
 *   customer path.
 *
 * ROUTE DESIGN:
 *   The router groups endpoints by domain so the admin UI can discover a
 *   single namespace for users, products, orders, inventory, coupons, and
 *   reviews without the backend inventing a second public API shape.
 *
 * QUICK ENDPOINT MAP:
 *   Users:     GET /users, GET /users/:id, PATCH /users/:id/block,
 *              PATCH /users/:id/unblock, PATCH /users/:id/deactivate
 *   Products:  GET /products, GET /products/:id, POST /products,
 *              PATCH /products/:id, PATCH /products/:id/activate,
 *              PATCH /products/:id/archive, DELETE /products/:id
 *   Orders:    GET /orders, GET /orders/:id, PATCH /orders/:id/status,
 *              PATCH /orders/:id/cancel, PATCH /orders/:id/refund
 *   Inventory: GET /inventory, GET /inventory/low-stock,
 *              PATCH /inventory/:productId
 *   Coupons:   GET /coupons, POST /coupons, PATCH /coupons/:id/enable,
 *              PATCH /coupons/:id/disable, GET /coupons/:id/usage
 *   Reviews:   GET /reviews, GET /reviews/:id, PATCH /reviews/:id/hide,
 *              PATCH /reviews/:id/restore, DELETE /reviews/:id
 */

import express from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  adminUserQuerySchema,
  adminReviewQuerySchema,
  adminInventoryReportQuerySchema,
  adminCouponUsageQuerySchema,
  adminRefundOrderSchema,
} from "../validations/admin.validation.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../../products/validations/product.validation.js";
import {
  createCouponSchema,
  couponQuerySchema,
} from "../../coupons/validations/coupon.validation.js";
import {
  orderQuerySchema,
  updateOrderStatusSchema,
} from "../../orders/validations/order.validation.js";
import {
  inventoryQuerySchema,
  adjustmentSchema,
} from "../../inventory/validations/inventory.validation.js";

const router = express.Router();

// Every route in this module is admin-only. Applying the guard at the router
// level keeps the security rule impossible to miss while still satisfying the
// "every route must use requireAuth + requireRole('admin')" requirement.
router.use(requireAuth, requireRole("admin"));

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

router.get(
  "/users",
  validateQuery(adminUserQuerySchema),
  adminController.getUsers
);

router.get("/users/:id", adminController.getUserById);

router.patch(
  "/users/:id/block",
  productRateLimiter,
  adminController.blockUser
);

router.patch(
  "/users/:id/unblock",
  productRateLimiter,
  adminController.unblockUser
);

router.patch(
  "/users/:id/deactivate",
  productRateLimiter,
  adminController.deactivateUser
);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

router.get(
  "/products",
  validateQuery(productQuerySchema),
  adminController.getProducts
);

router.get("/products/:id", adminController.getProductById);

router.post(
  "/products",
  productRateLimiter,
  validate(createProductSchema),
  adminController.createProduct
);

router.patch(
  "/products/:id",
  productRateLimiter,
  validate(updateProductSchema),
  adminController.updateProduct
);

router.patch(
  "/products/:id/activate",
  productRateLimiter,
  adminController.activateProduct
);

router.patch(
  "/products/:id/archive",
  productRateLimiter,
  adminController.archiveProduct
);

router.delete(
  "/products/:id",
  productRateLimiter,
  adminController.deleteProduct
);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

router.get(
  "/orders",
  validateQuery(orderQuerySchema),
  adminController.getOrders
);

router.get("/orders/:id", adminController.getOrderById);

router.patch(
  "/orders/:id/status",
  productRateLimiter,
  validate(updateOrderStatusSchema),
  adminController.updateOrderStatus
);

router.patch(
  "/orders/:id/cancel",
  productRateLimiter,
  adminController.cancelOrder
);

router.patch(
  "/orders/:id/refund",
  productRateLimiter,
  validate(adminRefundOrderSchema),
  adminController.refundOrder
);

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

router.get(
  "/inventory",
  validateQuery(inventoryQuerySchema),
  adminController.getInventory
);

router.get(
  "/inventory/low-stock",
  validateQuery(adminInventoryReportQuerySchema),
  adminController.getLowStockReport
);

router.patch(
  "/inventory/:productId",
  productRateLimiter,
  validate(adjustmentSchema),
  adminController.adjustInventory
);

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

router.get(
  "/coupons",
  validateQuery(couponQuerySchema),
  adminController.getCoupons
);

router.post(
  "/coupons",
  productRateLimiter,
  validate(createCouponSchema),
  adminController.createCoupon
);

router.patch(
  "/coupons/:id/enable",
  productRateLimiter,
  adminController.enableCoupon
);

router.patch(
  "/coupons/:id/disable",
  productRateLimiter,
  adminController.disableCoupon
);

router.get(
  "/coupons/:id/usage",
  validateQuery(adminCouponUsageQuerySchema),
  adminController.getCouponUsage
);

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

router.get(
  "/reviews",
  validateQuery(adminReviewQuerySchema),
  adminController.getReviews
);

router.get("/reviews/:id", adminController.getReviewById);

router.patch(
  "/reviews/:id/hide",
  productRateLimiter,
  adminController.hideReview
);

router.patch(
  "/reviews/:id/restore",
  productRateLimiter,
  adminController.restoreReview
);

router.delete(
  "/reviews/:id",
  productRateLimiter,
  adminController.deleteReview
);

export default router;
