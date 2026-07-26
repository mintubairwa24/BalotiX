/**
 * src/hooks/useCoupon.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Coupon-specific React Query hooks that encapsulate all coupon operations.
 * This is the ONLY way to interact with coupon data from components.
 * 
 * Provides:
 * 1. useCouponValidation() - Validate coupon code (preview discount, no side effects)
 * 2. useApplyCouponMutation() - Apply coupon to cart mutation
 * 3. useRemoveCouponMutation() - Remove coupon from cart mutation
 * 4. Utility: isCouponApplied(cart) - Check if coupon is on cart
 * 5. Utility: formatCouponDiscount(discount) - Format discount for display
 * 
 * STATE MANAGEMENT:
 * - React Query owns coupon validation preview data
 * - React Query owns applied coupon data (via cart query)
 * - Cart query is invalidated after apply/remove for fresh data
 * 
 * ERROR HANDLING:
 * - 409: Cart locked (checkout in progress) - user-friendly message
 * - 400: Invalid/expired coupon - backend error message displayed
 * - Network errors - retry support
 * 
 * DISCOUNT CALCULATION:
 * This hook NEVER calculates discounts.
 * All discount values come from backend via response.data.
 * Frontend displays only.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import * as couponService from "../services/coupon.service";

const CART_QUERY_KEY = ["cart"];

/**
 * Validate a coupon code (preview discount, no cart modification)
 * 
 * This is a mutation because:
 * - User types coupon code and clicks "Check"
 * - We need to show preview (discount amount, etc.)
 * - No cart modification occurs
 * - Can be called multiple times
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending, data, isError }
 * 
 * USAGE:
 * const { mutate: validateCode, data: preview, isPending } = useCouponValidation();
 * 
 * validateCode({ code: "SAVE10" }, {
 *   onSuccess: (preview) => {
 *     // preview = { code, discountAmount, discountPercentage, message }
 *     console.log(`You save ${preview.message}`);
 *   }
 * });
 * 
 * OUTPUT DATA:
 * {
 *   couponId: string,
 *   code: string,
 *   discountAmount: number (paise),
 *   discountPercentage: number (0-100),
 *   message: string
 * }
 * 
 * ERRORS:
 * - 400: Code not found, expired, or not applicable
 * - Backend returns message: "Coupon not found", "Coupon expired", etc.
 */
export const useCouponValidation = (options = {}) => {
  const [validationData, setValidationData] = useState(null);

  return useMutation({
    mutationFn: ({ code }) => couponService.validateCoupon(code),
    onSuccess: (response) => {
      const preview = response.data.data;
      setValidationData(preview);

      if (options.onSuccess) {
        options.onSuccess(preview);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to validate coupon";

      // Only show toast if not already showing one
      if (!validationData) {
        toast.error(message);
      }

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Apply validated coupon to the cart
 * 
 * This MODIFIES the cart:
 * 1. Backend validates coupon again (security)
 * 2. Applies coupon to cart document
 * 3. Cart total is recalculated with discount
 * 4. Stored in appliedCoupon field
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: applyCoupon, isPending } = useApplyCouponMutation();
 * 
 * applyCoupon({ code: "SAVE10" }, {
 *   onSuccess: (updatedCart) => {
 *     console.log(`Total saved: ${updatedCart.appliedCoupon.discountAmount}`);
 *   }
 * });
 * 
 * BEHAVIOR:
 * - If coupon already applied, this REPLACES it
 * - Cart query is automatically invalidated and refetched
 * - Cart total will reflect new discount
 * - Success toast: "Coupon applied!"
 * 
 * ERRORS:
 * - 409: Cart is locked (checkout in progress)
 *   Message: "Complete or cancel your current checkout first"
 * - 400: Code not found or invalid
 *   Message: Backend error message
 * 
 * AFTER CALLING:
 * - CartSummary re-renders with new total
 * - appliedCoupon badge appears
 * - CouponForm closes or shows success state
 */
export const useApplyCouponMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code }) => couponService.applyCoupon(code),
    onSuccess: (response) => {
      // Invalidate cart query to refetch with new discount applied
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      toast.success("Coupon applied!");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to apply coupon";

      // 409 = checkout locked
      if (error.response?.status === 409) {
        toast.error("Complete or cancel your current checkout first");
      } else {
        toast.error(message);
      }

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Remove applied coupon from cart
 * 
 * This MODIFIES the cart:
 * 1. Removes appliedCoupon field
 * 2. Cart total reverts to subtotal
 * 3. Updated cart returned
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: removeCoupon, isPending } = useRemoveCouponMutation();
 * 
 * removeCoupon(undefined, {
 *   onSuccess: (updatedCart) => {
 *     console.log(`New total: ${updatedCart.total}`);
 *   }
 * });
 * 
 * BEHAVIOR:
 * - Cart query is automatically invalidated and refetched
 * - Cart.total becomes cart.subtotal (no discount)
 * - appliedCoupon badge disappears
 * - Success toast: "Coupon removed"
 * 
 * ERRORS:
 * - 409: Cart is locked (checkout in progress)
 * - Unlikely to fail if coupon is already applied
 * 
 * AFTER CALLING:
 * - CartSummary re-renders with original total
 * - appliedCoupon section disappears
 * - "Remove Coupon" button disappears
 */
export const useRemoveCouponMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => couponService.removeCoupon(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Coupon removed");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to remove coupon";

      if (error.response?.status === 409) {
        toast.error("Complete or cancel your current checkout first");
      } else {
        toast.error(message);
      }

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * UTILITY: Check if a coupon is applied to cart
 * 
 * Use in components to conditionally show coupon badge, remove button, etc.
 * 
 * @param {Object} cart - Cart object from useCartQuery
 * @returns {boolean} True if appliedCoupon exists
 * 
 * USAGE:
 * const { data: cart } = useCartQuery();
 * const hasCoupon = isCouponApplied(cart);
 * 
 * if (hasCoupon) {
 *   <CouponBadge coupon={cart.appliedCoupon} onRemove={removeCoupon} />
 * }
 */
export const isCouponApplied = (cart) => {
  return cart?.appliedCoupon && cart.appliedCoupon.code ? true : false;
};

/**
 * UTILITY: Format discount amount for display
 * 
 * Converts paise to rupees with proper formatting.
 * 
 * @param {number} paise - Discount amount in paise
 * @returns {string} Formatted string like "₹500"
 * 
 * USAGE:
 * const discountText = formatCouponDiscount(cart.appliedCoupon.discountAmount);
 * <span>You save {discountText}</span>
 */
export const formatCouponDiscount = (paise) => {
  if (!paise) return "₹0";
  return `₹${Number(paise).toLocaleString("en-IN")}`;
};