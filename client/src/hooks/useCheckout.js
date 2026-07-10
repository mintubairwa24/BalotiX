/**
 * src/hooks/useCheckout.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Checkout-specific React Query hooks that orchestrate the final steps of
 * the purchase flow: locking the cart, creating the order, and cleaning up.
 * 
 * This hook DELIBERATELY does not duplicate cart/coupon/address logic.
 * It composes existing hooks from previous phases:
 * - useCartQuery, useCheckoutStart, useCheckoutAbandon (Phase 9, useCart.js)
 * - useAddresses (Phase 11, useAddress.js)
 * 
 * and adds ONLY what's new for this phase:
 * - useCreateOrder() – the actual order creation mutation
 * - useCheckoutReadiness() – utility to know if checkout can proceed
 * 
 * FLOW:
 * 1. CheckoutPage mounts
 * 2. Cart is fetched (useCartQuery, reused from Phase 9)
 * 3. If cart is not already locked, checkout-start is triggered
 *    (useCheckoutStart, reused from Phase 9) to reserve stock
 * 4. User reviews items, address, coupon
 * 5. User clicks "Place Order" → useCreateOrder() mutation fires
 * 6. On success: cart query invalidated, redirect to payment stub page
 *    with the new order's _id
 * 7. If user navigates away without placing order, useCheckoutAbandon()
 *    (reused from Phase 9) releases the stock reservation
 * 
 * WHY THIS APPROACH IS PRODUCTION-READY:
 * - No duplicate cart-locking logic — reuses Phase 9's proven checkout lock
 * - No duplicate discount/total calculation — backend remains single
 *   source of truth end-to-end
 * - Order creation invalidates cart cache, so UI reflects the cart being
 *   consumed immediately (no stale "11 items" badge after order placed)
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as orderService from "../services/order.service";

const CART_QUERY_KEY = ["cart"];
const ORDERS_QUERY_KEY = ["orders"];

/**
 * Create an order from the current (locked) cart
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending, isError }
 * 
 * USAGE:
 * const { mutate: placeOrder, isPending } = useCreateOrder({
 *   onSuccess: (order) => {
 *     navigate(`/checkout/success/${order._id}`);
 *   }
 * });
 * 
 * placeOrder({ shippingAddressId: selectedAddressId });
 * 
 * BEHAVIOR:
 * - Backend validates cart + address + stock
 * - Backend creates Order document (snapshotting items/address/coupon)
 * - Cart query is invalidated (cart is now consumed / reset by backend)
 * - Does NOT touch payment — that is a future phase
 * 
 * ERRORS:
 * - 400: Cart empty or missing address
 * - 404: Address not found
 * - 409: Cart not locked / stock changed since checkout started
 *   Message: Backend-provided, surfaced via toast
 */
export const useCreateOrder = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: (response) => {
      const order = response.data.data;

      // Cart has been consumed by order creation — refresh cart state
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      // Future orders list (Phase 13) should also see the new order
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });

      toast.success("Order placed successfully!");

      if (options.onSuccess) {
        options.onSuccess(order);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to place order";

      if (error.response?.status === 409) {
        toast.error("Your cart changed. Please review and try again.");
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
 * UTILITY: Determine if checkout can proceed
 * 
 * Centralizes the readiness rules so CheckoutPage and CheckoutActions
 * don't each re-implement this logic.
 * 
 * @param {Object} params
 * @param {Object} params.cart - Cart object from useCartQuery
 * @param {string} params.selectedAddressId - Currently selected address ID
 * @returns {{ ready: boolean, reason: string|null }}
 * 
 * USAGE:
 * const { ready, reason } = getCheckoutReadiness({ cart, selectedAddressId });
 * <CheckoutActions disabled={!ready} disabledReason={reason} />
 */
export const getCheckoutReadiness = ({ cart, selectedAddressId }) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return { ready: false, reason: "Your cart is empty" };
  }

  if (!selectedAddressId) {
    return { ready: false, reason: "Please select a shipping address" };
  }

  if (cart.status === "checkout_in_progress" && cart.locked === false) {
    // Defensive check; primary lock semantics come from backend cart.status
    return { ready: false, reason: "Cart is currently locked" };
  }

  return { ready: true, reason: null };
};