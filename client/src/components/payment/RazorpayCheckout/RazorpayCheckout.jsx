/**
 * src/components/payment/RazorpayCheckout/RazorpayCheckout.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * This is the ONLY component in NexCart that directly interacts with
 * `window.Razorpay`. Every other payment component (PaymentPage,
 * PaymentSummary, etc.) is Razorpay-agnostic — they just render UI and
 * call this component's `onClick` trigger. This isolation means if
 * Razorpay's SDK contract ever changes, only this one file is touched.
 * 
 * FULL CLIENT-SIDE FLOW (see payment.service.js for backend contract):
 * 1. loadRazorpayScript() — dynamically inject Razorpay's checkout.js
 *    (usePayment.js, Phase 13) if not already present
 * 2. useCreatePaymentSession() — ask backend to create a Razorpay Order
 *    tied to our NexCart order, get back { razorpayOrderId, amount,
 *    currency, keyId }
 * 3. Construct Razorpay options using ONLY that backend-provided data
 *    (never construct amount/currency independently on the frontend)
 * 4. `new window.Razorpay(options).open()` — hands control to Razorpay's
 *    own hosted, PCI-compliant modal. NexCart never sees card/UPI details.
 * 5. Razorpay's `handler` callback fires with
 *    { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * 6. useVerifyPayment() forwards this EXACTLY as received to the
 *    backend — no modification, no inspection
 * 7. Backend is the sole authority on whether the signature is valid;
 *    this component only reacts to the backend's verdict (onSuccess/onError)
 * 8. Razorpay's `modal.ondismiss` fires if the user closes the modal
 *    without paying — treated as a cancellation, not a verified failure
 * 
 * SECURITY GUARANTEES:
 * - No Razorpay SECRET key ever appears here or anywhere in frontend code
 * - No signature computation or validation happens client-side
 * - The `keyId` used below is Razorpay's PUBLIC/publishable key,
 *   explicitly designed to be embedded in client-side checkout widgets
 * 
 * Props:
 * - order: Order object (for description/customer prefill)
 * - onPaymentSuccess: callback(verificationResult)
 * - onPaymentFailure: callback(message)
 * - onModalDismissed: callback() — user closed Razorpay modal without paying
 * - children: render-prop-style trigger, receives { onPay, isProcessing }
 */

import { useCallback } from "react";
import {
  loadRazorpayScript,
  useCreatePaymentSession,
  useVerifyPayment,
} from "../../../hooks/usePayment";
import { usePaymentStore } from "../../../store/payment.store";

export const RazorpayCheckout = ({
  order,
  onPaymentSuccess,
  onPaymentFailure,
  onModalDismissed,
  children,
}) => {
  const {
    startSessionCreation,
    startAwaitingPayment,
    startVerifying,
    markSuccess,
    markFailed,
  } = usePaymentStore();

  const { mutate: createSession, isPending: isCreatingSession } =
    useCreatePaymentSession({
      onSuccess: (session) => {
        startAwaitingPayment();

        const options = {
          key: session.razorpayKeyId,
          amount: session.amount,
          currency: session.currency,
          order_id: session.razorpayOrderId,
          name: "NexCart",
          description: `Payment for order ${order.orderNumber || order._id}`,
          prefill: {
            name: order.shippingAddress?.fullName,
            contact: order.shippingAddress?.phoneNumber,
          },
          theme: {
            color: "#2563eb",
          },
          handler: (response) => {
            startVerifying();
            verifyPayment({
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
          modal: {
            ondismiss: () => {
              onModalDismissed?.();
            },
          },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", (response) => {
          const message =
            response.error?.description || "Payment failed. Please try again.";
          markFailed(message);
          onPaymentFailure?.(message);
        });

        rzp.open();
      },
    });

  const { mutate: verifyPayment, isPending: isVerifying } = useVerifyPayment({
    onSuccess: (result) => {
      markSuccess();
      onPaymentSuccess?.(result);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Payment verification failed";
      markFailed(message);
      onPaymentFailure?.(message);
    },
  });

  const handlePay = useCallback(async () => {
    if (!order?._id) return;

    // Step 1: Ensure Razorpay's SDK is available
    startSessionCreation();
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      const message =
        "Unable to load payment gateway. Please check your internet connection.";
      markFailed(message);
      onPaymentFailure?.(message);
      return;
    }

    // Step 2: Ask backend to create a Razorpay session for this order
    createSession(order._id, {
      onError: (error) => {
        const message =
          error.response?.data?.message || "Failed to start payment session";
        markFailed(message);
        onPaymentFailure?.(message);
      },
    });
  }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

  const isProcessing = isCreatingSession || isVerifying;

  // Render-prop pattern: parent controls the actual button UI,
  // this component only supplies the trigger + busy state
  return children({ onPay: handlePay, isProcessing });
};