/**
 * order.controller.js
 *
 * WHO CALLS IT:
 *   order.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as every prior module: extract from req,
 *   call service, send response. Zero business logic, zero direct Cart/
 *   Inventory/Coupon/Product access — all of that orchestration lives in
 *   order.service.js. Every method is wrapped in try/catch, passing
 *   errors to next(error) for the global error handler.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as orderService from "../services/order.service.js";

// ─── Create Order ─────────────────────────────────────────────────────────────
/**
 * POST /api/orders
 * Customer only. Takes no body — order contents are read entirely from
 * the authenticated customer's own Cart server-side (see
 * createOrderSchema's doc comment for why this is a deliberate security
 * choice, not a missing feature).
 */
export const createOrder = async (req, res, next) => {
  try {
    const result = await orderService.createOrderFromCart(
      req.user._id,
      req.body?.shippingAddressId
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Orders ─────────────────────────────────────────────────────────────
/**
 * GET /api/orders/my-orders
 * Customer only. Always scoped to req.user._id — see
 * order.service.js's getMyOrders for why no caller-supplied userId can
 * ever override this.
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const result = await orderService.getMyOrders(req.user._id, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Orders (Admin) ───────────────────────────────────────────────────
/**
 * GET /api/orders
 * Admin only. Unfiltered-by-owner — every customer's orders are visible.
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Order By ID ──────────────────────────────────────────────────────────
/**
 * GET /api/orders/:id
 * Customer (own orders only) or Admin (any order). The isAdmin flag is
 * derived here from req.user.role and passed into the service, which
 * performs the actual ownership comparison — the controller itself never
 * makes the access-control decision, only supplies the inputs to it.
 */
export const getOrderById = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === "admin";
    const result = await orderService.getOrderById(
      req.params.id,
      req.user._id,
      isAdmin
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Cancel Order ─────────────────────────────────────────────────────────────
/**
 * PATCH /api/orders/:id/cancel
 * Customer only, own orders only — ownership is enforced inside
 * order.service.js's cancelOrder, not here.
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(
      req.params.id,
      req.user._id,
      req.body.reason
    );

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
/**
 * PATCH /api/orders/:id/status
 * Admin only. See order.service.js's updateOrderStatus for the
 * Inventory/Cart side effects baked into specific status transitions.
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await orderService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Order status updated to "${result.status}"`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};