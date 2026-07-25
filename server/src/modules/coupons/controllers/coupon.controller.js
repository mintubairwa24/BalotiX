/**
 * coupon.controller.js
 *
 * WHO CALLS IT:
 *   coupon.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as every prior module: extract from req,
 *   call service, send response. Zero business logic, zero direct Cart or
 *   CouponRedemption access — all of that lives in coupon.service.js.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as couponService from "../services/coupon.service.js";

// ─── Create Coupon ────────────────────────────────────────────────────────────
/**
 * POST /api/coupons
 * Admin only.
 */
export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.createCoupon(req.body, req.user._id);

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get All Coupons ──────────────────────────────────────────────────────────
/**
 * GET /api/coupons
 * Admin only.
 */
export const getAllCoupons = async (req, res, next) => {
  try {
    const result = await couponService.getAllCoupons(req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Coupon By ID ─────────────────────────────────────────────────────────
/**
 * GET /api/coupons/:id
 * Admin only.
 */
export const getCouponById = async (req, res, next) => {
  try {
    const coupon = await couponService.getCouponById(req.params.id);

    res.status(200).json({
      success: true,
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Coupon ────────────────────────────────────────────────────────────
/**
 * PUT /api/coupons/:id
 * Admin only.
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await couponService.updateCoupon(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Deactivate Coupon ────────────────────────────────────────────────────────
/**
 * DELETE /api/coupons/:id
 * Admin only. Kill-switch, not a delete — see service doc comment.
 */
export const deactivateCoupon = async (req, res, next) => {
  try {
    const result = await couponService.deactivateCoupon(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Coupon deactivated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/coupons/:id/status
 * Admin only. Toggles coupon active state without changing its other fields.
 */
export const updateCouponStatus = async (req, res, next) => {
  try {
    const result = await couponService.updateCouponStatus(
      req.params.id,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Coupon status updated to ${result.isActive ? "active" : "inactive"}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/coupons/:id/usage
 * Admin only. Returns redemption summary and paginated usage history.
 */
export const getCouponUsage = async (req, res, next) => {
  try {
    const result = await couponService.getCouponUsage(req.params.id, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Validate Coupon (Read-Only Preview) ─────────────────────────────────────
/**
 * POST /api/coupons/validate
 * Any authenticated customer. Returns the discount WITHOUT applying it.
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const result = await couponService.validateCoupon(
      req.body.code,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Apply Coupon To Cart ─────────────────────────────────────────────────────
/**
 * POST /api/coupons/apply
 * Any authenticated customer.
 */
export const applyCoupon = async (req, res, next) => {
  try {
    const cart = await couponService.applyCoupon(req.user._id, req.body.code);

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Remove Coupon From Cart ──────────────────────────────────────────────────
/**
 * DELETE /api/coupons/apply
 * Any authenticated customer.
 */
export const removeCouponFromCart = async (req, res, next) => {
  try {
    const cart = await couponService.removeCouponFromCart(req.user._id);

    res.status(200).json({
      success: true,
      message: "Coupon removed from cart",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};
