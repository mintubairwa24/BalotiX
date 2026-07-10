/**
 * src/components/coupon/CouponInput/CouponInput.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Reusable input field for entering coupon codes.
 * Handles user input, validation feedback, and formatting.
 * 
 * USAGE:
 * <CouponInput
 *   value="SAVE10"
 *   onChange={(e) => setCode(e.target.value)}
 *   placeholder="Enter coupon code"
 *   disabled={isValidating}
 * />
 * 
 * FEATURES:
 * - Auto-uppercase (coupons are case-insensitive)
 * - Disabled state during validation
 * - Clear visual feedback
 * - Dark mode support
 */

import { Ticket } from "lucide-react";

export const CouponInput = ({
  value,
  onChange,
  placeholder = "Enter coupon code",
  disabled = false,
  error = null,
}) => {
  return (
    <div>
      <div className="relative">
        {/* Icon */}
        <Ticket
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 pointer-events-none"
        />

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg font-mono uppercase transition-colors
            ${
              error
                ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
            text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
          `}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};