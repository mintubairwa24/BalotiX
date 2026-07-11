/**
 * src/pages/payment/PaymentPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * The payment page at route /payment/:orderId. This is the exact
 * hand-off point Phase 12's CheckoutSuccessRedirect pointed to
 * ("Payment integration is coming soon") — that placeholder is now
 * replaced by a real link to this page.
 * 
 * RESPONSIBILITIES:
 * 1. Fetch the order (reused: order.service.js -> getOrderById, Phase 12)
 * 2. Check current payment status (usePaymentStatus, this phase) — if
 *    already paid (e.g. user hit back button after success), redirect
 *    straight to PaymentSuccessPage instead of allowing a double payment
 * 3. Show PaymentSummary + PaymentMethods (this phase)
 * 4. Host RazorpayCheckout (this phase) as the "Pay Now" trigger
 * 5. On verified success -> navigate to /payment/success/:orderId
 * 6. On verified/SDK failure -> navigate to /payment/failed/:orderId
 * 7. On modal dismissal (user cancelled) -> stay on this page, reset
 *    status to idle so they can try again without a full reload
 * 
 * BACKEND INTEGRATION:
 * - GET /orders/:id (Phase 12 order.service.js) — order details
 * - GET /payment/status/:orderId (this phase) — current payment state
 * - POST /payment/create-order (this phase, via RazorpayCheckout) — session
 * - POST /payment/verify (this phase, via RazorpayCheckout) — verification
 * 
 * REUSE, NOT DUPLICATION:
 * - order.service.js / getOrderById (Phase 12)
 * - PaymentSummary, PaymentMethods, PaymentLoader, PaymentError (this phase)
 * - RazorpayCheckout (this phase) — all Razorpay SDK logic lives there
 */

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";

import * as orderService from "../../services/order.service";
import { usePaymentStatus } from "../../hooks/usePayment";
import { usePaymentStore } from "../../store/payment.store";

import {
  PaymentSummary,
  PaymentMethods,
  PaymentLoader,
  PaymentError,
  RazorpayCheckout,
} from "../../components/payment";

export const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const {
    status,
    errorMessage,
    setCurrentOrderId,
    resetPaymentStore,
  } = usePaymentStore();

  // Reused from Phase 12 — order details (items, total, orderNumber)
  const {
    data: order,
    isLoading: isLoadingOrder,
    isError: isOrderError,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await orderService.getOrderById(orderId);
      return response.data.data;
    },
    enabled: !!orderId,
  });

  // This phase — check if payment was already completed (e.g. back button)
  const { data: paymentStatus, isLoading: isLoadingStatus } =
    usePaymentStatus(orderId);

  useEffect(() => {
    setCurrentOrderId(orderId);
    return () => resetPaymentStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // If already paid, don't allow re-payment — go straight to success
  useEffect(() => {
    if (paymentStatus?.paymentStatus === "paid") {
      navigate(`/payment/success/${orderId}`, { replace: true });
    }
  }, [paymentStatus, orderId, navigate]);

  const handlePaymentSuccess = () => {
    navigate(`/payment/success/${orderId}`);
  };

  const handlePaymentFailure = () => {
    navigate(`/payment/failed/${orderId}`);
  };

  const handleModalDismissed = () => {
    // User closed Razorpay's modal without paying — let them retry
    // from this same page rather than treating it as a hard failure
    resetPaymentStore();
    setCurrentOrderId(orderId);
  };

  const isLoading = isLoadingOrder || isLoadingStatus;
  const isBusy =
    status === "creating_session" ||
    status === "awaiting_payment" ||
    status === "verifying";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Payment
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex items-center gap-1">
          <ShieldCheck size={14} />
          Secured by Razorpay
        </p>

        {/* Loading order/status */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        )}

        {/* Order fetch error */}
        {!isLoading && isOrderError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Unable to load order
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                Please check the link or try again from your orders page.
              </p>
            </div>
          </div>
        )}

        {/* Main payment content */}
        {!isLoading && !isOrderError && order && (
          <div className="space-y-4">
            {/* Busy state (creating session / awaiting payment / verifying) */}
            {isBusy && <PaymentLoader status={status} />}

            {/* Inline failure (e.g. session creation failed before modal opened) */}
            {status === "failed" && !isBusy && (
              <PaymentError
                message={errorMessage}
                onRetry={() => resetPaymentStore()}
              />
            )}

            {/* Default review state */}
            {!isBusy && status !== "failed" && (
              <>
                <PaymentSummary order={order} />
                <PaymentMethods />

                <RazorpayCheckout
                  order={order}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                  onModalDismissed={handleModalDismissed}
                >
                  {({ onPay, isProcessing }) => (
                    <button
                      onClick={onPay}
                      disabled={isProcessing}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </RazorpayCheckout>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};