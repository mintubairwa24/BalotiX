/**
 * src/pages/payment/PaymentSuccessPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Terminal "payment succeeded" page at /payment/success/:orderId.
 * 
 * WHY THIS RE-FETCHES STATUS INSTEAD OF TRUSTING NAVIGATION STATE:
 * A user could reach this URL directly (bookmarked, back/forward
 * navigation, shared link) without having just completed a payment.
 * Since this is a money-related confirmation, the page re-confirms the
 * true state via usePaymentStatus() (this phase, backend-sourced)
 * rather than assuming success just because the route was hit. If the
 * backend reports the order is NOT actually paid, this page shows a
 * pending state instead of falsely confirming success.
 * 
 * BACKEND INTEGRATION:
 * - GET /payment/status/:orderId (this phase) — authoritative status
 * - GET /orders/:id (Phase 12) — order number/total for display
 * 
 * REUSE:
 * - PaymentStatus (this phase) — status badge
 * - usePaymentStatus (this phase)
 * - order.service.js getOrderById (Phase 12)
 */

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight, Package } from "lucide-react";

import * as orderService from "../../services/order.service";
import { usePaymentStatus } from "../../hooks/usePayment";
import { PaymentStatus } from "../../components/payment";

export const PaymentSuccessPage = () => {
  const { orderId } = useParams();

  const { data: paymentStatus, isLoading: isLoadingStatus } =
    usePaymentStatus(orderId);

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await orderService.getOrderById(orderId);
      return response.data.data.order ?? response.data.data;
    },
    enabled: !!orderId,
  });

  const formatPrice = (paise) => {
    if (paise === undefined || paise === null) return "₹0";
    return `₹${(Number(paise) / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isLoading = isLoadingStatus || isLoadingOrder;
  // Authoritative — from backend, not assumed from the route being hit
  const isActuallyPaid = paymentStatus?.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Package size={32} className="text-green-600 dark:text-green-400" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isActuallyPaid ? "Payment Successful!" : "Order Received"}
            </h1>

            <div className="flex justify-center mb-4">
              <PaymentStatus
                status={isActuallyPaid ? "paid" : "pending"}
              />
            </div>

            {order && (
              <div className="mb-6 text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Order Number
                  </span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    {order.orderNumber || order._id}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Amount Paid
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatPrice(order.totalAmount ?? order.total)}
                  </span>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {isActuallyPaid
                ? "Thank you for your order! We'll send you updates as it ships."
                : "We're still confirming your payment. This page will update shortly."}
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Continue Shopping
              <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};