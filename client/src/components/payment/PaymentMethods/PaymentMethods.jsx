/**
 * src/components/payment/PaymentMethods/PaymentMethods.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Purely informational strip showing which payment methods are
 * accepted (UPI, Cards, Netbanking, Wallets). 
 * 
 * IMPORTANT — WHY THIS IS NOT A METHOD SELECTOR:
 * Razorpay's own hosted Checkout modal (launched by RazorpayCheckout,
 * this phase) already provides the full method-selection UI — tabs for
 * UPI/Cards/Netbanking/Wallets, saved cards, etc. Rebuilding that
 * selection UI here would duplicate Razorpay's PCI-compliant,
 * continuously-updated widget with a NexCart-built substitute, which is
 * both redundant and a compliance risk (handling method selection
 * outside Razorpay's sandboxed iframe unnecessarily).
 * 
 * This component exists only to set expectations on PaymentPage BEFORE
 * the modal opens ("here's what you'll be able to pay with"), not to
 * collect a method choice. No selection state, no props to control it.
 */

import { Smartphone, CreditCard, Landmark, Wallet } from "lucide-react";

const METHODS = [
  { icon: Smartphone, label: "UPI" },
  { icon: CreditCard, label: "Cards" },
  { icon: Landmark, label: "Netbanking" },
  { icon: Wallet, label: "Wallets" },
];

export const PaymentMethods = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Accepted Payment Methods
      </h3>
      <div className="grid grid-cols-4 gap-3">
        {METHODS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 py-2 border border-gray-100 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        You'll choose your exact payment method inside the secure Razorpay checkout.
      </p>
    </div>
  );
};