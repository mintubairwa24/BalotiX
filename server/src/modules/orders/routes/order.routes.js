/**
 * order.routes.js
 *
 * WHO CALLS IT:
 *   app.js mounts this router at "/api/orders".
 *   Example: app.use("/api/orders", orderRoutes)
 *
 * WHY IT EXISTS:
 *   Defines the API surface of the Order Module. The access pattern
 *   mirrors Coupon's asymmetric shape: customer-facing routes need only
 *   requireAuth (ownership enforced inside the service layer, not via
 *   role), while admin routes additionally require requireRole("admin").
 *
 * ROUTE ORDER (critical, same discipline as every prior module):
 *   "/my-orders" is a literal path and MUST be declared before "/:id", or
 *   Express would try to treat "my-orders" as an order ID and the route
 *   would never match. "/:id/cancel" and "/:id/status" are distinct
 *   suffixed paths, so they don't collide with the plain "/:id" GET route
 *   regardless of declaration order — but are kept directly below it here
 *   for readability.
 *
 * REUSE NOTE:
 *   Reuses requireAuth, requireRole, validate/validateQuery, and
 *   productRateLimiter from shared/middleware/ — identical infrastructure
 *   to every prior module.
 */

import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { requireAuth, requireRole } from "../../../shared/middleware/auth.middleware.js";
import { validate, validateQuery } from "../../../shared/middleware/validate.middleware.js";
import { productRateLimiter } from "../../../shared/middleware/rateLimiter.middleware.js";
import {
  createOrderSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
} from "../validations/order.validation.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMER ROUTES — requireAuth only; ownership enforced in the service layer.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/orders
 * Creates an order from the authenticated customer's own cart.
 */
router.post(
  "/",
  productRateLimiter,
  requireAuth,
  validate(createOrderSchema),
  orderController.createOrder
);

/**
 * GET /api/orders/my-orders
 * Declared before "/:id" — literal path must win over the parameterised
 * route, same discipline as product.routes.js's "/featured" and "/search".
 */
router.get(
  "/my-orders",
  requireAuth,
  validateQuery(orderQuerySchema),
  orderController.getMyOrders
);

/**
 * GET /api/orders/:id
 * Customer can view only their own order; admin can view any order — the
 * distinction is resolved inside order.service.js's getOrderById.
 */
router.get("/:id", requireAuth, orderController.getOrderById);

/**
 * PATCH /api/orders/:id/cancel
 * Customer self-service cancellation, restricted to "pending"/"confirmed"
 * orders only — see order.service.js's cancelOrder for the full rule.
 */
router.patch(
  "/:id/cancel",
  productRateLimiter,
  requireAuth,
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN ROUTES — requireAuth + requireRole("admin").
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/orders
 * Lists every order across every customer — admin dashboard view.
 */
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  validateQuery(orderQuerySchema),
  orderController.getAllOrders
);

/**
 * PATCH /api/orders/:id/status
 * Admin transitions an order through its fulfilment lifecycle. Certain
 * transitions trigger Inventory/Cart side effects — see
 * order.service.js's updateOrderStatus doc comment.
 */
router.patch(
  "/:id/status",
  productRateLimiter,
  requireAuth,
  requireRole("admin"),
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;