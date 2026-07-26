/**
 * src/components/orders/OrderStatusBadge/OrderStatusBadge.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Colored badge representing an ORDER's lifecycle status — distinct
 * from Phase 13's PaymentStatus, which only represents the narrower
 * paid/pending/failed payment state. An order can be "confirmed" (paid)
 * but still "processing" or "shipped" — order status and payment status
 * are separate dimensions, so they get separate badge components rather
 * than overloading PaymentStatus with values it was never designed for.
 * 
 * Used in:
 * - OrderCard (list view)
 * - OrderDetailsPage (detail view)
 * - OrderTimeline (implicitly, via the same STATUS_CONFIG colors)
 * 
 * ASSUMED STATUS ENUM (verify against actual backend — see
 * order.service.js header comment):
 * "pending_payment" | "confirmed" | "processing" | "shipped" |
 * "delivered" | "cancelled"
 * 
 * If your backend uses different status strings, update ONLY the
 * STATUS_CONFIG map below — every consumer of this component
 * automatically reflects the change.
 * 
 * Props:
 * - status: string (one of the enum values above)
 * - size: "sm" | "md" (default "md")
 */

import {
  Clock,
  CheckCircle2,
  PackageSearch,
  Truck,
  PackageCheck,
  XCircle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending_payment: {
    icon: Clock,
    label: "Pending Payment",
    classes:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700",
  },
  confirmed: {
    icon: CheckCircle2,
    label: "Confirmed",
    classes:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
  },
  processing: {
    icon: PackageSearch,
    label: "Processing",
    classes:
      "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700",
  },
  shipped: {
    icon: Truck,
    label: "Shipped",
    classes:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700",
  },
  delivered: {
    icon: PackageCheck,
    label: "Delivered",
    classes:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelled",
    classes:
      "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700",
  },
};

export const OrderStatusBadge = ({ status, size = "md" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending_payment;
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

// Exported so OrderTimeline can reuse the same status ordering/config
// without redefining it — single source of truth for the status enum
export { STATUS_CONFIG as ORDER_STATUS_CONFIG };