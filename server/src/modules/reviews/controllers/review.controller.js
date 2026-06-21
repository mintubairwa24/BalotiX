/**
 * review.controller.js
 *
 * WHO CALLS IT:
 *   review.routes.js wires each route handler to a function in this file.
 *
 * WHY IT EXISTS:
 *   Same thin-controller contract as every prior module: extract from req,
 *   call service, send response. Zero business logic, zero direct Order/
 *   Product access — all of that (verified-purchase checking, rating
 *   recalculation) lives in review.service.js. Every method is wrapped in
 *   try/catch, passing errors to next(error) for the global error handler.
 *
 * INPUT:   Express req, res, next
 * OUTPUT:  JSON HTTP response via res.status(...).json(...)
 */

import * as reviewService from "../services/review.service.js";

// ─── Create Review ────────────────────────────────────────────────────────────
/**
 * POST /api/reviews
 * Authenticated customer only. Eligibility (purchased + delivered + not
 * already reviewed) is fully enforced inside reviewService.createReview —
 * the controller does not pre-check anything itself.
 */
export const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Review By ID ─────────────────────────────────────────────────────────
/**
 * GET /api/reviews/:id
 */
export const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);

    res.status(200).json({
      success: true,
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Product Reviews ──────────────────────────────────────────────────────
/**
 * GET /api/reviews/product/:productId
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getProductReviews(
      req.params.productId,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get My Reviews ───────────────────────────────────────────────────────────
/**
 * GET /api/reviews/my-reviews
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getUserReviews(
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Update Review ────────────────────────────────────────────────────────────
/**
 * PATCH /api/reviews/:id
 * Ownership enforced inside reviewService.updateReview, not here.
 */
export const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.params.id,
      req.user._id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────
/**
 * DELETE /api/reviews/:id
 * Ownership enforced inside reviewService.deleteReview, not here.
 */
export const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: { _id: result._id },
    });
  } catch (error) {
    next(error);
  }
};