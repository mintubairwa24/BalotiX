/**
 * src/components/coupon/CouponError/CouponError.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Error confirmation shown when coupon validation or application fails.
 * Displays backend error message and provides retry/close options.
 * 
 * ERROR CASES:
 * - Code not found
 * - Code expired
 * - Not eligible (min amount, restrictions, etc.)
 * - Cart locked (checkout in progress)
 * - Network error
 * 
 * USAGE:
 * <CouponError
 *   message="Coupon not found"
 *   onRetry={() => setPhase('input')}
 *   onClose={() => closeCouponForm()}
 * />
 * 
 * PROPS:
 * - message: string (error message from backend)
 * - onRetry: callback to try again
 * - onClose: callback to close form
 */

import { motion } from "framer-motion";
import { AlertCircle, RotateCcw, X } from "lucide-react";

export const CouponError = ({ message, onRetry, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="border-t border-gray-200 dark:border-gray-700 pt-4"
    >
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        {/* Error Icon + Message */}
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle
            size={24}
            className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
          />

          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              Coupon Invalid
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors text-sm"
          >
            <RotateCcw size={16} />
            Try Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 font-medium rounded transition-colors text-sm"
          >
            <X size={16} className="inline mr-1" />
            Close
          </button>
        </div>
      </div>
    </motion.div>
  );
};