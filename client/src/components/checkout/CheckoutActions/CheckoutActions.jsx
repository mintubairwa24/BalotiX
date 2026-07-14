/**
 * src/components/checkout/CheckoutActions/CheckoutActions.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Owns the "Place Order" call-to-action — the single most important
 * button in the checkout flow. Centralizes:
 * 1. Readiness validation (via getCheckoutReadiness utility, this phase)
 * 2. Order creation trigger (useCreateOrder, this phase)
 * 3. Loading/disabled state during the mutation
 * 4. Redirect to the payment stub page after success
 * 
 * WHY THIS IS A SEPARATE COMPONENT (not inline in CheckoutPage):
 * - Keeps CheckoutPage focused on layout/composition
 * - Makes the "place order" trigger independently testable
 * - Mirrors the pattern established by CartSummary's "Proceed to
 *   Checkout" button and AddressSelector's own action button —
 *   each checkout-adjacent action lives in its own component
 * 
 * Props:
 * - cart: cart object (for readiness check)
 * - selectedAddressId: currently selected address
 * - onOrderPlaced: callback(order) — CheckoutPage handles the actual
 *   navigation, keeping this component navigation-agnostic and reusable
 */

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useCreateOrder, getCheckoutReadiness } from "../../../hooks/useCheckout";
import { useCheckoutStore } from "../../../store/checkout.store";

export const CheckoutActions = ({ cart, selectedAddressId, onOrderPlaced }) => {
  const [attempted, setAttempted] = useState(false);
  const { setCurrentStep } = useCheckoutStore();

  const { ready, reason } = getCheckoutReadiness({ cart, selectedAddressId });

  const { mutate: placeOrder, isPending } = useCreateOrder({
    onSuccess: (order) => {
      setCurrentStep("done");
      onOrderPlaced?.(order);
    },
    onError: () => {
      setCurrentStep("review");
    },
  });

  const handlePlaceOrder = () => {
    setAttempted(true);
    if (!ready) return;

    setCurrentStep("placing");
    placeOrder({ shippingAddressId: selectedAddressId });
  };

  return (
    <div
      id="checkout-actions"
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
    >
      {/* Readiness warning (only shown after user attempts to place order) */}
      {attempted && !ready && (
        <div className="flex items-start gap-2 mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-sm text-amber-800 dark:text-amber-200">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{reason}</span>
        </div>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={isPending}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isPending && <Loader2 size={18} className="animate-spin" />}
        {isPending ? "Placing Order..." : "Place Order"}
      </button>

      <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        By placing your order, you agree to NexCart's terms of service.
      </p>
    </div>
  );
};