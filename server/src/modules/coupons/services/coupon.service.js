/**
 * coupon.service.js
 *
 * WHO CALLS IT:
 *   coupon.controller.js for all HTTP-driven operations. The future Orders
 *   module will call redeemCoupon() at the moment payment confirms — this
 *   is the intended integration point, mirroring how Cart's
 *   confirmCheckout() is meant to be called by Orders once that module exists.
 *
 * WHY IT EXISTS:
 *   Owns every rule about whether a coupon can be used and how much it
 *   discounts. This is the ONLY file permitted to write Coupon.usedCount,
 *   the ONLY file permitted to write Cart.appliedCoupon, and the ONLY file
 *   permitted to create CouponRedemption records — centralising all three
 *   is what keeps "a coupon is only ever truly consumed at order
 *   confirmation" an enforceable rule rather than just a comment.
 *
 * THE APPLY-VS-REDEEM DISTINCTION (read before touching this file):
 *   applyCoupon() is a PREVIEW. It validates the coupon, computes the
 *   discount, and writes it onto Cart.appliedCoupon — but does NOT touch
 *   Coupon.usedCount and does NOT write a CouponRedemption record. A
 *   customer can apply, remove, and re-apply a coupon freely while
 *   shopping with zero effect on usage limits.
 *
 *   redeemCoupon() is PERMANENT. It atomically increments Coupon.usedCount
 *   and writes one CouponRedemption record. This is intended to be called
 *   exactly once, at the moment an order is confirmed — never speculatively.
 *   This mirrors Inventory's reserveStock (provisional) vs
 *   confirmReservation (permanent) split precisely.
 *
 * INPUT:   Validated, type-safe data from the controller (already passed Zod)
 * OUTPUT:  Plain JS objects or thrown errors with .statusCode attached
 */

import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";
import CouponRedemption from "../models/couponredempation.model.js";
import Cart from "../../cart/models/cart.model.js";

// ─── Internal Helper: Run the full validation chain ──────────────────────────
/**
 * Not exported. Runs every independent check that can reject a coupon, in
 * sequence, throwing on the first failure. Each check is deliberately
 * separate (not combined into one giant boolean) so the error message
 * tells the customer exactly which condition failed, rather than a generic
 * "coupon invalid."
 *
 * @param {Document} coupon  - The Coupon document being validated
 * @param {string} userId    - MongoDB ObjectId of the customer attempting to use it
 * @param {number} subtotal  - The cart's current subtotal (live, from Cart.subtotal)
 */
const runValidationChain = async (coupon, userId, subtotal) => {
  if (!coupon.isActive) {
    const error = new Error("This coupon is no longer active");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  if (now < coupon.validFrom) {
    const error = new Error("This coupon is not yet valid");
    error.statusCode = 400;
    throw error;
  }

  if (now > coupon.validUntil) {
    const error = new Error("This coupon has expired");
    error.statusCode = 400;
    throw error;
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    const error = new Error("This coupon has reached its usage limit");
    error.statusCode = 409;
    throw error;
  }

  // Per-user check — cannot be derived from Coupon's own usedCount, hence
  // the query against CouponRedemption. See couponRedemption.model.js.
  const userRedemptionCount = await CouponRedemption.countDocuments({
    couponId: coupon._id,
    userId,
  });

  if (userRedemptionCount >= coupon.usagePerUser) {
    const error = new Error(
      "You have already used this coupon the maximum number of times"
    );
    error.statusCode = 409;
    throw error;
  }

  if (subtotal < coupon.minOrderValue) {
    const error = new Error(
      `This coupon requires a minimum order value of ${coupon.minOrderValue}`
    );
    error.statusCode = 400;
    throw error;
  }
};

// ─── Internal Helper: Compute the discount amount ────────────────────────────
/**
 * Not exported. Resolves discountType + discountValue + maxDiscountAmount
 * into one final rupee amount, clamped so the discount can never exceed
 * the cart's own subtotal (a coupon can never make the total negative).
 *
 * @param {Document} coupon  - The Coupon document
 * @param {number} subtotal  - The cart's current subtotal
 * @returns {number}         - The resolved discount amount
 */
const computeDiscount = (coupon, subtotal) => {
  let discount;

  if (coupon.discountType === "percentage") {
    discount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount !== null) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    // "fixed" — never needs a cap, since it can't exceed its own configured value
    discount = coupon.discountValue;
  }

  // Never let a coupon discount more than the cart is worth
  return Math.min(discount, subtotal);
};

// ─── Create Coupon ────────────────────────────────────────────────────────────
/**
 * Admin creates a new coupon. Code uniqueness is enforced by the schema's
 * unique index; a pre-check here gives a cleaner error than a raw MongoDB
 * duplicate-key error, same pattern as product.service.js's SKU check.
 *
 * @param {Object} couponData - Validated fields from createCouponSchema
 * @param {string} adminId    - The _id of the authenticated admin user
 * @returns {Object}          - The newly created coupon document
 */
export const createCoupon = async (couponData, adminId) => {
  const codeExists = await Coupon.findOne({
    code: couponData.code.toUpperCase(),
  });
  if (codeExists) {
    const error = new Error(`Coupon code "${couponData.code}" already exists`);
    error.statusCode = 409;
    throw error;
  }

  const coupon = await Coupon.create({
    ...couponData,
    createdBy: adminId,
    updatedBy: adminId,
  });

  return coupon.toJSON();
};

// ─── Get All Coupons (Admin Dashboard Listing) ───────────────────────────────
/**
 * @param {Object} query - Validated query params from couponQuerySchema
 * @returns {Object}     - { coupons, pagination }
 */
export const getAllCoupons = async (query) => {
  const { page, limit, isActive } = query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;

  const skip = (page - 1) * limit;

  const [coupons, totalCount] = await Promise.all([
    Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Coupon.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return {
    coupons,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

// ─── Get Coupon By ID ─────────────────────────────────────────────────────────
/**
 * @param {string} couponId - MongoDB ObjectId of the Coupon
 * @returns {Object}        - Coupon document with virtuals
 */
export const getCouponById = async (couponId) => {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    const error = new Error("Invalid coupon ID format");
    error.statusCode = 400;
    throw error;
  }

  const coupon = await Coupon.findById(couponId).lean({ virtuals: true });

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  return coupon;
};

// ─── Update Coupon ────────────────────────────────────────────────────────────
/**
 * @param {string} couponId  - MongoDB ObjectId of the Coupon
 * @param {Object} updateData - Partial fields (validated by Zod)
 * @param {string} adminId   - The requesting admin's _id
 * @returns {Object}         - Updated coupon document
 */
export const updateCoupon = async (couponId, updateData, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    const error = new Error("Invalid coupon ID format");
    error.statusCode = 400;
    throw error;
  }

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  // Code uniqueness re-check if the code itself is being changed
  if (updateData.code && updateData.code.toUpperCase() !== coupon.code) {
    const codeExists = await Coupon.findOne({
      code: updateData.code.toUpperCase(),
      _id: { $ne: coupon._id },
    });
    if (codeExists) {
      const error = new Error(
        `Coupon code "${updateData.code}" already exists`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  Object.assign(coupon, updateData);
  coupon.updatedBy = adminId;
  await coupon.save();

  return coupon.toJSON();
};

// ─── Deactivate Coupon ────────────────────────────────────────────────────────
/**
 * Admin kill-switch — sets isActive to false. Not a delete; the coupon
 * document and its full CouponRedemption history remain intact for
 * reporting, exactly like every prior module's soft-delete-only discipline.
 *
 * @param {string} couponId - MongoDB ObjectId of the Coupon
 * @param {string} adminId  - The requesting admin's _id
 * @returns {Object}        - { _id, isActive }
 */
export const deactivateCoupon = async (couponId, adminId) => {
  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    const error = new Error("Invalid coupon ID format");
    error.statusCode = 400;
    throw error;
  }

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  coupon.isActive = false;
  coupon.updatedBy = adminId;
  await coupon.save();

  return { _id: coupon._id, isActive: coupon.isActive };
};

// ─── Validate Coupon (Read-Only Check) ───────────────────────────────────────
/**
 * Runs the full validation chain and returns the computed discount WITHOUT
 * writing anything — not to Cart, not to Coupon, not to CouponRedemption.
 * Used by a "preview" UI that wants to show "this code would save you ₹X"
 * before the customer commits to applying it.
 *
 * @param {string} code    - The coupon code to check
 * @param {string} userId  - MongoDB ObjectId of the authenticated user
 * @returns {Object}       - { coupon, discountAmount }
 */
export const validateCoupon = async (code, userId) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    const error = new Error("Invalid coupon code");
    error.statusCode = 404;
    throw error;
  }

  const cart = await Cart.findOne({ userId });
  const subtotal = cart ? cart.subtotal : 0;

  await runValidationChain(coupon, userId, subtotal);

  const discountAmount = computeDiscount(coupon, subtotal);

  return { coupon: coupon.toJSON(), discountAmount };
};

// ─── Apply Coupon To Cart ─────────────────────────────────────────────────────
/**
 * Validates and writes the discount onto Cart.appliedCoupon. PROVISIONAL —
 * see the APPLY-VS-REDEEM DISTINCTION in the file header. Does not touch
 * Coupon.usedCount or create a CouponRedemption record.
 *
 * @param {string} userId  - MongoDB ObjectId of the authenticated user
 * @param {string} code    - The coupon code to apply
 * @returns {Object}       - Updated cart document with appliedCoupon set
 */
export const applyCoupon = async (userId, code) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    const error = new Error("Invalid coupon code");
    error.statusCode = 404;
    throw error;
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  if (cart.status === "checkout_in_progress") {
    const error = new Error("Cannot modify cart while checkout is in progress");
    error.statusCode = 409;
    throw error;
  }

  if (cart.items.length === 0) {
    const error = new Error("Cannot apply a coupon to an empty cart");
    error.statusCode = 400;
    throw error;
  }

  await runValidationChain(coupon, userId, cart.subtotal);

  const discountAmount = computeDiscount(coupon, cart.subtotal);

  cart.appliedCoupon = {
    couponId: coupon._id,
    code: coupon.code,
    discountAmount,
  };
  await cart.save();

  return cart.toJSON();
};

// ─── Remove Coupon From Cart ──────────────────────────────────────────────────
/**
 * Clears Cart.appliedCoupon. Since applyCoupon never touched usedCount or
 * CouponRedemption, removal is a pure no-side-effect operation — there is
 * nothing to roll back, unlike Cart's checkout reservation flow which
 * needed an explicit release step against Inventory.
 *
 * @param {string} userId - MongoDB ObjectId of the authenticated user
 * @returns {Object}      - Updated cart document, appliedCoupon cleared
 */
export const removeCouponFromCart = async (userId) => {
  const cart = await Cart.findOne({ userId });

  if (!cart || !cart.appliedCoupon) {
    const error = new Error("No coupon is currently applied to your cart");
    error.statusCode = 400;
    throw error;
  }

  cart.appliedCoupon = null;
  await cart.save();

  return cart.toJSON();
};

// ─── Redeem Coupon (Permanent — called at order confirmation) ───────────────
/**
 * Makes a coupon usage PERMANENT: atomically increments Coupon.usedCount
 * and writes one CouponRedemption record. Intended to be called exactly
 * once, by the future Orders module, at the moment payment confirms —
 * mirroring confirmReservation's role in the Inventory/Cart relationship.
 *
 * Uses an atomic $inc with a $lt usageLimit guard in the filter (when a
 * limit is set) so two simultaneous confirmations against the last
 * remaining redemption slot cannot both succeed — same race-condition
 * discipline as inventory.service.js's atomic stock operations.
 *
 * @param {string} couponId        - MongoDB ObjectId of the Coupon
 * @param {string} userId          - MongoDB ObjectId of the customer
 * @param {string} orderRef        - ObjectId of the confirmed Order
 * @param {number} discountApplied - The exact amount this redemption saved
 * @returns {Object}               - { couponId, userId, discountApplied }
 */
export const redeemCoupon = async (
  couponId,
  userId,
  orderRef,
  discountApplied
) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  // Atomic guard: only increments if usageLimit (when set) has not been
  // reached. Filter expresses the check; $inc expresses the mutation —
  // both happen as one indivisible database instruction.
  const filter = { _id: couponId };
  if (coupon.usageLimit !== null) {
    filter.usedCount = { $lt: coupon.usageLimit };
  }

  const updated = await Coupon.findOneAndUpdate(
    filter,
    { $inc: { usedCount: 1 } },
    { new: true }
  );

  if (!updated) {
    const error = new Error(
      "This coupon's usage limit was reached before redemption could complete"
    );
    error.statusCode = 409;
    throw error;
  }

  await CouponRedemption.create({
    couponId,
    userId,
    orderRef,
    discountApplied,
  });

  return { couponId, userId, discountApplied };
};