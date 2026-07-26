/**
 * src/components/coupon/CouponSuccess/CouponSuccess.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Success confirmation shown after coupon is successfully applied.
 * Displays what discount was applied and auto-closes.
 * 
 * USAGE:
 * <CouponSuccess coupon={appliedCoupon} />
 * 
 * PROPS:
 * - coupon: { code, discountAmount, discountPercentage }
 * 
 * BEHAVIOR:
 * - Shows success icon + message
 * - Displays discount breakdown
 * - Auto-closes form after 2 seconds
 * - Smooth animation
 */

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export const CouponSuccess = ({ coupon }) => {
  if (!coupon) return null;

  const formatDiscount = (paise) => {
    if (!paise) return "₹0";
    return `₹${Number(paise).toLocaleString("en-IN")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="border-t border-gray-200 dark:border-gray-700 pt-4"
    >
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        {/* Success Icon */}
        <div className="flex items-start gap-3">
          <CheckCircle
            size={24}
            className="text-green-600 dark:text-green-400 shrink-0 mt-0.5"
          />

          <div className="flex-1">
            {/* Title */}
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Coupon Applied!
            </h3>

            {/* Success Details */}
            <div className="space-y-1 text-sm">
              <p className="text-green-800 dark:text-green-200">
                <span className="font-mono font-bold">{coupon.code}</span> saved you{" "}
                <span className="font-semibold">
                  {formatDiscount(coupon.discountAmount)} ({coupon.discountPercentage}%)
                </span>
              </p>
              <p className="text-green-700 dark:text-green-300 text-xs">
                Your cart total has been updated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator (form closing) */}
      <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
        Closing in a moment...
      </div>
    </motion.div>
  );
};