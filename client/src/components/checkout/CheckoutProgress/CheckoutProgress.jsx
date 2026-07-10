/**
 * src/components/checkout/CheckoutProgress/CheckoutProgress.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Purely presentational stepper showing where the user is in the
 * checkout flow: Cart -> Review & Address -> Placing Order.
 * 
 * Driven entirely by props (currentStep) — no data fetching, no mutations.
 * Kept dumb on purpose so it's trivial to reuse/reskin later
 * (e.g. Phase 13 could reuse a similar pattern for order tracking).
 * 
 * Steps:
 * 1. "cart"    - Implicit (user came from CartPage, already completed)
 * 2. "review"  - User reviewing items/address/coupon (current default)
 * 3. "placing" - Order creation in flight
 * 4. "done"    - Order created, redirecting
 * 
 * Props:
 * - currentStep: "review" | "placing" | "done"
 */

import { Check, ShoppingCart, ClipboardCheck, Loader2 } from "lucide-react";

const STEPS = [
  { key: "cart", label: "Cart", icon: ShoppingCart },
  { key: "review", label: "Review & Address", icon: ClipboardCheck },
  { key: "placing", label: "Place Order", icon: Loader2 },
];

const STEP_ORDER = ["cart", "review", "placing", "done"];

export const CheckoutProgress = ({ currentStep = "review" }) => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
      {STEPS.map((step, index) => {
        const stepIndex = STEP_ORDER.indexOf(step.key);
        const isCompleted = stepIndex < currentIndex || currentStep === "done";
        const isActive = step.key === currentStep;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                  ${
                    isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : isActive
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
                  }`}
              >
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  <Icon
                    size={16}
                    className={isActive && step.key === "placing" ? "animate-spin" : ""}
                  />
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium hidden sm:block ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : isCompleted
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors ${
                  isCompleted ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};