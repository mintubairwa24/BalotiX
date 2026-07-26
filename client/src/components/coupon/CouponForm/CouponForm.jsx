/**
 * src/components/coupon/CouponForm/CouponForm.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Container component that orchestrates the entire coupon application flow:
 * 1. Input phase: User enters coupon code
 * 2. Validation phase: Code is validated, preview shown
 * 3. Application phase: User applies validated coupon
 * 4. Confirmation phase: Success or error shown
 * 
 * FLOW:
 * User clicks "Apply Coupon" button
 *   ↓
 * CouponForm opens (toggle)
 *   ↓
 * User enters code + clicks "Check Discount"
 *   ↓
 * useCouponValidation validates (preview only, no cart change)
 *   ↓
 * If valid: Show preview (you save ₹X)
 * If invalid: Show error (expired, not found, etc)
 *   ↓
 * User clicks "Apply" button
 *   ↓
 * useApplyCouponMutation applies to cart (cart total changes)
 *   ↓
 * Success: Toast + form closes
 * Error: Show error message
 * 
 * STATE MANAGEMENT:
 * - useCouponStore: Form open/close, selected code, validation preview
 * - useCouponValidation: Validation request/response
 * - useApplyCouponMutation: Apply request/response
 * - useCartQuery: Cart data (for displayed total, itemCount check)
 * 
 * PROPS:
 * - onClose: optional callback when form closes
 * 
 * INTEGRATION:
 * Typically rendered in CartSummary or as a separate Modal.
 * Only shown if cart.items.length > 0 (can't apply coupon to empty cart)
 */

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { useCouponValidation, useApplyCouponMutation } from "../../../hooks/useCoupon";
import { useCouponStore } from "../../../store/coupon.store";
import { CouponInput } from "../../coupon/CouponInput/CouponInput";
import { CouponSuccess } from "../../coupon/CouponSuccess/CouponSuccess";
import { CouponError } from "../../coupon/CouponError/CouponError";
import { CouponSkeleton } from "../../coupon/CouponSkeleton/CouponSkeleton";

export const CouponForm = ({ onClose }) => {
  const {
    isCouponFormOpen,
    validationPreview,
    selectedCode,
    openCouponForm,
    closeCouponForm,
    setSelectedCode,
    setValidationPreview,
    clearValidationPreview,
    resetCouponForm,
  } = useCouponStore();

  // Form phase state
  const [phase, setPhase] = useState("input"); // "input" | "preview" | "success" | "error"

  // Validation mutation (dry run, no cart change)
  const {
    mutate: validateCode,
    isPending: isValidating,
    isError: validationError,
    error: validationErrorObj,
  } = useCouponValidation({
    onSuccess: (preview) => {
      setValidationPreview(preview);
      setPhase("preview");
    },
    onError: () => {
      setPhase("error");
    },
  });

  // Application mutation (actually apply to cart)
  const {
    mutate: applyCoupon,
    isPending: isApplying,
    isError: applyError,
    error: applyErrorObj,
  } = useApplyCouponMutation({
    onSuccess: () => {
      setPhase("success");
      // Auto-close after 2 seconds
      setTimeout(() => {
        resetCouponForm();
        if (onClose) onClose();
      }, 2000);
    },
    onError: () => {
      setPhase("error");
    },
  });

  // Handle validate button click
  const handleValidate = (e) => {
    e.preventDefault();
    if (!selectedCode.trim()) return;
    validateCode({ code: selectedCode.toUpperCase() });
  };

  // Handle apply button click
  const handleApply = (e) => {
    e.preventDefault();
    if (validationPreview) {
      applyCoupon({ code: validationPreview.code });
    }
  };

  // Handle form close
  const handleClose = () => {
    resetCouponForm();
    if (onClose) onClose();
  };

  // Handle code input change
  const handleCodeChange = (e) => {
    setSelectedCode(e.target.value);
    // Clear preview when user changes code
    if (validationPreview) {
      clearValidationPreview();
      setPhase("input");
    }
  };

  if (!isCouponFormOpen) {
    return null;
  }

  // Loading state while validating
  if (isValidating || isApplying) {
    return <CouponSkeleton />;
  }

  // Success state
  if (phase === "success") {
    return <CouponSuccess coupon={validationPreview} />;
  }

  // Error state
  if (phase === "error") {
    const errorMessage =
      validationErrorObj?.response?.data?.message ||
      applyErrorObj?.response?.data?.message ||
      "Failed to process coupon";

    return (
      <CouponError
        message={errorMessage}
        onRetry={() => {
          setPhase("input");
          clearValidationPreview();
        }}
        onClose={handleClose}
      />
    );
  }

  // Input/Preview state
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      {/* Form Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {phase === "input" ? "Apply Coupon" : "Confirm Coupon"}
        </h3>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Close"
        >
          <X size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <form onSubmit={phase === "input" ? handleValidate : handleApply}>
        {/* Input Phase */}
        {phase === "input" && (
          <div className="space-y-3">
            <CouponInput
              value={selectedCode}
              onChange={handleCodeChange}
              placeholder="Enter coupon code"
              disabled={isValidating}
            />
            <button
              type="submit"
              disabled={isValidating || !selectedCode.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded transition-colors"
            >
              {isValidating ? "Checking..." : "Check Discount"}
            </button>
          </div>
        )}

        {/* Preview Phase */}
        {phase === "preview" && validationPreview && (
          <div className="space-y-3">
            {/* Preview Result */}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <p className="text-sm text-green-800 dark:text-green-200">
                <span className="font-semibold">✓ Valid Coupon</span>
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                {validationPreview.message}
              </p>
              <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-300">
                  Code: <span className="font-mono font-semibold">{validationPreview.code}</span>
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Discount: {validationPreview.discountPercentage}% ({`₹${Number(validationPreview.discountAmount).toLocaleString("en-IN")}`})
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isApplying}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded transition-colors"
              >
                {isApplying ? "Applying..." : "Apply Coupon"}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearValidationPreview();
                  setPhase("input");
                }}
                disabled={isApplying}
                className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium rounded transition-colors disabled:opacity-50"
              >
                Try Another
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};