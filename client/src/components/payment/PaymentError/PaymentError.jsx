/**
 * src/components/payment/PaymentError/PaymentError.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays a payment failure with a human-readable reason and a
 * "Retry Payment" action. Used in two places:
 * 1. Inline on PaymentPage — if session creation or verification fails
 *    without leaving the page (e.g. network error before Razorpay even opens)
 * 2. On PaymentFailedPage — as the primary content when the user is
 *    routed there after a failed/cancelled payment
 * 
 * SECURITY NOTE:
 * The `message` prop must always be a backend-provided or Razorpay-
 * provided human-readable string (e.g. "Payment was cancelled",
 * "Signature verification failed"). This component never receives or
 * displays raw signature data, keys, or internal error stack traces —
 * that filtering happens in usePayment.js / RazorpayCheckout before
 * this component is even rendered.
 * 
 * Props:
 * - message: string - reason for failure
 * - onRetry: callback - triggers a fresh payment attempt
 */

import { XCircle, RotateCcw } from "lucide-react";

export const PaymentError = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
        <XCircle size={32} className="text-red-600 dark:text-red-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        Payment Failed
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mb-6">
        {message || "Something went wrong while processing your payment."}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <RotateCcw size={16} />
          Retry Payment
        </button>
      )}
    </div>
  );
};