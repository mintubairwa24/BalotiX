/**
 * src/components/payment/PaymentStatus/PaymentStatus.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Reusable status indicator (icon + colored banner) representing a
 * payment's final or current state. Deliberately generic so it can be
 * reused beyond this phase — e.g. a future Orders list (Phase 13/14)
 * showing "Paid" / "Pending" / "Failed" chips next to each order.
 * 
 * Purely presentational — no data fetching, no store access. Callers
 * (PaymentSuccessPage, PaymentFailedPage, future OrderCard) pass the
 * status they already have from React Query.
 * 
 * Props:
 * - status: "paid" | "pending" | "failed"
 * - size: "sm" | "md" (default "md")
 */

import { CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  paid: {
    icon: CheckCircle,
    label: "Payment Successful",
    classes:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
  },
  pending: {
    icon: Clock,
    label: "Payment Pending",
    classes:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700",
  },
  failed: {
    icon: XCircle,
    label: "Payment Failed",
    classes:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700",
  },
};

export const PaymentStatus = ({ status = "pending", size = "md" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses =
    size === "sm" ? "px-2 py-1 text-xs gap-1" : "px-3 py-1.5 text-sm gap-1.5";
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <div
      className={`inline-flex items-center border rounded-full font-medium ${config.classes} ${sizeClasses}`}
    >
      <Icon size={iconSize} />
      <span>{config.label}</span>
    </div>
  );
};