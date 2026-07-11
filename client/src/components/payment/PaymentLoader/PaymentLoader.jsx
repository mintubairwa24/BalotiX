/**
 * src/components/payment/PaymentLoader/PaymentLoader.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Status-aware loading indicator for the payment flow. Reads the
 * current phase from payment.store's `status` and shows an appropriate
 * message — rather than a generic spinner — so the user understands
 * WHY they're waiting (creating session vs. waiting inside Razorpay's
 * modal vs. backend verifying).
 * 
 * Purely presentational — takes `status` as a prop so it stays testable
 * and doesn't couple itself to the store directly (PaymentPage reads
 * the store and passes the value down).
 * 
 * Props:
 * - status: "creating_session" | "awaiting_payment" | "verifying"
 */

import { Loader2, ShieldCheck } from "lucide-react";

const STATUS_MESSAGES = {
  creating_session: "Preparing your secure payment session...",
  awaiting_payment: "Waiting for you to complete payment in Razorpay...",
  verifying: "Verifying your payment with our servers...",
};

export const PaymentLoader = ({ status }) => {
  const message = STATUS_MESSAGES[status] || "Processing...";

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative mb-4">
        <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-400" />
      </div>

      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        {message}
      </p>

      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <ShieldCheck size={14} />
        Secured by Razorpay — please do not close this page
      </p>
    </div>
  );
};