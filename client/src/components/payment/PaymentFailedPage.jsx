/**
 * src/pages/payment/PaymentFailedPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Terminal "payment failed" page at /payment/failed/:orderId. Reached
 * when RazorpayCheckout's onPaymentFailure fires (session creation
 * failed, Razorpay reported payment.failed, or backend verification
 * rejected the signature).
 * 
 * WHY A SEPARATE ROUTE RATHER THAN AN INLINE STATE ON PaymentPage:
 * Same reasoning as PaymentSuccessPage — a durable, shareable/bookmarkable
 * URL that reflects "this order's payment attempt did not succeed",
 * independent of whatever in-memory state PaymentPage had at the time.
 * It also gives the ORDER (not just the payment attempt) a stable place
 * to link back to a fresh retry.
 * 
 * The order itself is NOT cancelled by a failed payment — the backend
 * keeps it in a pending-payment state, so "Retry Payment" simply routes
 * back to /payment/:orderId to start a new Razorpay session for the
 * SAME order (no new order is created).
 * 
 * REUSE:
 * - PaymentError (this phase) — failure UI + retry button
 * - PaymentStatus (this phase) — failed badge
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { PaymentError, PaymentStatus } from "../../components/payment";

export const PaymentFailedPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate(`/payment/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex justify-center mb-4">
          <PaymentStatus status="failed" />
        </div>

        <PaymentError
          message="Your payment could not be completed. Your order is saved — you can try paying again."
          onRetry={handleRetry}
        />

        <div className="text-center mt-4">
          <Link
            to="/"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};