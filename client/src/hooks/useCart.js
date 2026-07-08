/**
 * src/hooks/useCart.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Single hook that encapsulates ALL cart-related React Query operations.
 * This is the ONLY way to interact with cart data from components.
 * 
 * Provides:
 * 1. useCartQuery() - Fetch current cart (uses React Query)
 * 2. useAddToCart() - Mutation to add item
 * 3. useUpdateQuantity() - Mutation to update quantity
 * 4. useRemoveFromCart() - Mutation to remove item
 * 5. useClearCart() - Mutation to clear all items
 * 6. useValidateCoupon() - Mutation to preview coupon
 * 7. useApplyCoupon() - Mutation to apply coupon
 * 8. useRemoveCoupon() - Mutation to remove coupon
 * 9. useCheckoutStart() - Mutation to lock cart and reserve stock
 * 10. useCheckoutConfirm() - Mutation to confirm payment
 * 11. useCheckoutAbandon() - Mutation to release reservation
 * 
 * CHECKOUT LOCK PATTERN:
 * When backend returns cart.status === "checkout_in_progress":
 * - All mutations (except checkoutConfirm/checkoutAbandon) will fail with 409
 * - Frontend MUST read this status and disable UI controls
 * - Components check: isCheckoutLocked = cart?.status === "checkout_in_progress"
 * 
 * INVALIDATION STRATEGY:
 * After every cart mutation, React Query automatically refetches the cart
 * via "onSuccess" -> queryClient.invalidateQueries({ queryKey: ["cart"] })
 * 
 * STALE TIME:
 * Cart always uses staleTime: 0 (treat as always fresh)
 * because users add items frequently and we want immediate UI updates
 * 
 * COMPONENT INTEGRATION:
 * In CartPage, Header, MiniCart:
 * 
 * const { data: cart, isLoading, error } = useCartQuery();
 * const { mutate: addItem, isPending } = useAddToCart();
 * 
 * if (cart?.status === "checkout_in_progress") {
 *   // disable quantity input, remove button, show "Checkout in progress" message
 * }
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import toast from "react-hot-toast";
import * as cartService from "../services/cart.service";

const CART_QUERY_KEY = ["cart"];

/**
 * Fetch current cart
 * 
 * @returns {Object} { data: cart, isLoading, error, isError }
 * 
 * Cart shape:
 * {
 *   _id, userId,
 *   status: "active" | "checkout_in_progress",
 *   items: [...],
 *   itemCount: number,
 *   totalQuantity: number,
 *   subtotal: number (paise),
 *   total: number (paise),
 *   appliedCoupon: { couponId, code, discountAmount } | null
 * }
 */
export const useCartQuery = () => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const response = await cartService.getCart();
      return response.data.data; // Extract cart from { success, data: { cart } }
    },
    staleTime: 0, // Always treat as fresh (users add items frequently)
    gcTime: 1000 * 60 * 5, // 5 min in memory after unused
    retry: 1,
  });
};

/**
 * Add product to cart
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending, isError }
 * 
 * USAGE:
 * const { mutate: addItem } = useAddToCart();
 * addItem({ productId: "123", quantity: 1 });
 * 
 * ERRORS:
 * - 409: Cart locked (checkout in progress)
 * - 400: Product not found or out of stock
 * - 401: Not authenticated
 */
export const useAddToCart = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity = 1 }) =>
      cartService.addToCart(productId, quantity),
    onSuccess: (response) => {
      // Invalidate cart query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      // Toast feedback
      toast.success("Added to cart");

      // Custom callback if provided
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to add to cart";

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
 * Update quantity of cart item
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending, isError }
 * 
 * USAGE:
 * const { mutate: updateQty } = useUpdateQuantity();
 * updateQty({ productId: "123", quantity: 5 });
 */
export const useUpdateQuantity = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }) =>
      cartService.updateCartQuantity(productId, quantity),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update quantity";

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
 * Remove item from cart
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending, isError }
 * 
 * USAGE:
 * const { mutate: removeItem } = useRemoveFromCart();
 * removeItem({ productId: "123" });
 */
export const useRemoveFromCart = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId }) => cartService.removeFromCart(productId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Removed from cart");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to remove item";

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
 * Clear entire cart
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 */
export const useClearCart = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to clear cart";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Validate coupon (preview discount, no side effects)
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending, data }
 * 
 * USAGE:
 * const { mutate: validateCoupon, data: preview } = useValidateCoupon();
 * validateCoupon({ code: "SAVE10" });
 * 
 * preview = { couponId, code, discountAmount, discountPercentage, message }
 */
export const useValidateCoupon = (options = {}) => {
  return useMutation({
    mutationFn: ({ code }) => cartService.validateCoupon(code),
    onSuccess: (response) => {
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Coupon validation failed";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Apply coupon to cart
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 */
export const useApplyCoupon = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code }) => cartService.applyCoupon(code),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Coupon applied!");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to apply coupon";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Remove applied coupon from cart
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 */
export const useRemoveCoupon = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
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
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Start checkout (lock cart, reserve stock)
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * AFTER SUCCESS:
 * - cart.status = "checkout_in_progress"
 * - orderId and orderNumber returned
 * - Stock reserved (30 min timeout)
 * - All quantity/remove operations blocked
 * 
 * USAGE:
 * const { mutate: startCheckout } = useCheckoutStart({
 *   onSuccess: (orderData) => {
 *     navigate(`/checkout?orderId=${orderData.orderId}`);
 *   }
 * });
 * startCheckout();
 */
export const useCheckoutStart = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.checkoutStart(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to start checkout";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Confirm checkout after payment succeeds
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: confirmCheckout } = useCheckoutConfirm({
 *   onSuccess: (data) => {
 *     navigate(`/order-confirmation/${data.order.orderNumber}`);
 *   }
 * });
 * confirmCheckout({ paymentId, signature });
 */
export const useCheckoutConfirm = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, signature }) =>
      cartService.checkoutConfirm(paymentId, signature),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Order confirmed!");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Payment confirmation failed";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Abandon/cancel checkout (release stock reservation)
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: abandonCheckout } = useCheckoutAbandon({
 *   onSuccess: () => {
 *     toast.info("Checkout cancelled. Your cart is still here.");
 *   }
 * });
 * abandonCheckout();
 */
export const useCheckoutAbandon = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.checkoutAbandon(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to cancel checkout";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * UTILITY: Check if cart is locked (checkout in progress)
 * 
 * Use this in components to conditionally disable UI:
 * 
 * const { data: cart } = useCartQuery();
 * const isLocked = isCheckoutLocked(cart);
 * 
 * <button disabled={isLocked}>Update Quantity</button>
 */
export const isCheckoutLocked = (cart) => {
  return cart?.status === "checkout_in_progress";
};

/**
 * UTILITY: Format cart total for display
 * 
 * const { data: cart } = useCartQuery();
 * <p>Total: {formatCartTotal(cart?.total)}</p>
 */
export const formatCartTotal = (paise) => {
  if (!paise) return "₹0";
  return `₹${Number(paise).toLocaleString("en-IN")}`;
};