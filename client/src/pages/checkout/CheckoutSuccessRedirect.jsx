/**
 * src/pages/checkout/CheckoutSuccessRedirect.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Transitional page shown immediately after an order is successfully
 * created (POST /orders succeeded in CheckoutPage). Route:
 * /checkout/success/:orderId
 * 
 * THIS PHASE'S SCOPE ENDS HERE, DELIBERATELY:
 * Per Phase 12 requirements, payment gateway integration (Razorpay),
 * payment verification, and payment success/failure pages are explicitly
 * OUT of scope. This page's job is to:
 * 1. Confirm the order was created (fetch order by ID for confirmation
 *    details — order number, total)
 * 2. Show a brief "Order placed" confirmation
 * 3. Provide the clearly-marked hand-off point where a future Payment
 *    phase will redirect to the actual payment gateway page
 * 
 * WHY A SEPARATE PAGE INSTEAD OF INLINE IN CheckoutPage:
 * - Gives the order a permanent, shareable URL (/checkout/success/:id)
 *   independent of cart/checkout state, which by this point has already
 *   been reset by the backend
 * - Cleanly separates "reviewing/placing an order" (CheckoutPage) from
 *   "an order now exists" (this page) — matches how Phase 13 (Orders)
 *   will link back to specific orders
 * - Makes it trivial for a future phase to extend this into the real
 *   payment flow without touching CheckoutPage at all
 * 
 * BACKEND INTEGRATION:
 * - GET /orders/:id (order.service.js, this phase) — used only to
 *   display the order number/total for confirmation; the order itself
 *   was already created by CheckoutPage before navigating here
 */

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";
import * as orderService from "../../services/order.service";

export const CheckoutSuccessRedirect = () => {
  const { orderId } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await orderService.getOrderById(orderId);
      return response.data.data;
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Order Placed Successfully!
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : order ? (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Order Number
            </p>
            <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white mb-2">
              {order.orderNumber || order._id}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Amount
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatPrice(order.total)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Your order has been created.
          </p>
        )}

        {/*
          PAYMENT HAND-OFF POINT (Future Phase):
          This is where a future Payment phase will redirect to the
          actual Razorpay checkout flow, e.g.:
          navigate(`/payment/${orderId}`)
          For this phase, we show a placeholder action instead of
          implementing payment.
        */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-200 mb-4">
          Payment integration is coming soon. Your order is saved and
          awaiting payment.
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Continue Shopping
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};