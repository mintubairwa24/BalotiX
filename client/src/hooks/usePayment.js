/**
 * src/hooks/usePayment.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Payment-specific React Query hooks + the Razorpay SDK loading utility.
 * This is the ONLY place components should reach for payment operations.
 * 
 * Provides:
 * 1. loadRazorpayScript() - dynamically injects Razorpay's checkout.js
 * 2. useCreatePaymentSession() - mutation to start a Razorpay session
 * 3. useVerifyPayment() - mutation to forward Razorpay's response to backend
 * 4. usePaymentStatus(orderId) - query to check current payment state
 * 
 * WHY THE SDK IS LOADED DYNAMICALLY (NOT IMPORTED/BUNDLED):
 * Razorpay explicitly requires their checkout.js to be loaded from their
 * own CDN (https://checkout.razorpay.com/v1/checkout.js) at runtime,
 * not bundled via npm/webpack. This is a Razorpay platform requirement,
 * not a NexCart architecture choice — bundling it would break PCI
 * compliance guarantees Razorpay provides and may not reflect the
 * latest security patches to their checkout widget.
 * 
 * SECURITY BOUNDARY:
 * - useCreatePaymentSession() and useVerifyPayment() are thin wrappers
 *   around payment.service.js — no signature logic lives here either.
 * - The actual Razorpay modal invocation (`new window.Razorpay(options)`)
 *   lives in the RazorpayCheckout component, not this hook file, since
 *   it's a DOM/SDK interaction rather than server state — this hook
 *   only handles the React Query (server state) half of the flow.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as paymentService from "../services/payment.service";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Dynamically load the Razorpay Checkout SDK script
 * 
 * Injects a <script> tag pointing to Razorpay's CDN if not already
 * present, and resolves once it has loaded. Safe to call multiple
 * times — subsequent calls resolve immediately if the script (or an
 * in-flight load) already exists.
 * 
 * @returns {Promise<boolean>} resolves true on success, false on failure
 * 
 * USAGE:
 * const loaded = await loadRazorpayScript();
 * if (!loaded) {
 *   toast.error("Unable to load payment gateway. Check your connection.");
 *   return;
 * }
 * const rzp = new window.Razorpay(options);
 * rzp.open();
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Already loaded — resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Already injected but maybe still loading — attach to existing tag
    const existingScript = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    // Inject fresh script tag
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Create a Razorpay payment session for an order
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: createSession, isPending } = useCreatePaymentSession({
 *   onSuccess: (session) => {
 *     // session = { razorpayOrderId, amount, currency, keyId, orderId }
 *     openRazorpayCheckout(session);
 *   }
 * });
 * 
 * createSession(orderId);
 * 
 * ERRORS:
 * - 400: Order not in payable state (e.g. already paid)
 * - 404: Order not found
 */
export const useCreatePaymentSession = (options = {}) => {
  return useMutation({
    mutationFn: (orderId) => paymentService.createPaymentSession(orderId),
    onSuccess: (response) => {
      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to start payment session";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Forward Razorpay's checkout response to backend for verification
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: verify, isPending } = useVerifyPayment({
 *   onSuccess: (result) => navigate(`/payment/success/${orderId}`),
 *   onError: () => navigate(`/payment/failed/${orderId}`)
 * });
 * 
 * // Called from Razorpay's handler callback:
 * verify({
 *   orderId,
 *   razorpay_order_id: response.razorpay_order_id,
 *   razorpay_payment_id: response.razorpay_payment_id,
 *   razorpay_signature: response.razorpay_signature,
 * });
 * 
 * IMPORTANT:
 * This mutation does NOT decide success/failure itself — it simply
 * relays the backend's verdict. A resolved promise (onSuccess) means
 * the BACKEND verified the signature and confirmed the order. A
 * rejected promise (onError) means verification failed server-side.
 * The frontend never makes this determination independently.
 */
export const useVerifyPayment = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (verificationData) =>
      paymentService.verifyPayment(verificationData),
    onSuccess: (response) => {
      // Order state changed (now paid/confirmed) — refresh anything
      // that depends on it
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (response.data.data?.orderId) {
        queryClient.invalidateQueries({
          queryKey: ["order", response.data.data.orderId],
        });
      }

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Payment verification failed";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Get the current payment status for an order
 * 
 * @param {string} orderId
 * @returns {Object} { data: status, isLoading, error }
 * 
 * USAGE:
 * const { data: status } = usePaymentStatus(orderId);
 * // status = { orderId, paymentStatus, orderStatus, total, orderNumber }
 * 
 * Used by:
 * - PaymentPage: check if already paid before showing "Pay Now" again
 * - PaymentSuccessPage / PaymentFailedPage: confirm final state from
 *   the backend rather than trusting only in-memory navigation state
 */
export const usePaymentStatus = (orderId) => {
  return useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: async () => {
      const response = await paymentService.getPaymentStatus(orderId);
      return response.data.data;
    },
    enabled: !!orderId,
    staleTime: 0,
    retry: 1,
  });
};