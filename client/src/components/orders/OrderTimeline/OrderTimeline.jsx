/**
 * src/components/orders/OrderTimeline/OrderTimeline.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Visual vertical timeline showing the order's progression through its
 * lifecycle (confirmed -> processing -> shipped -> delivered), with
 * timestamps where the backend provides them.
 * 
 * REUSE — SINGLE SOURCE OF TRUTH FOR STATUS CONFIG:
 * Imports ORDER_STATUS_CONFIG from OrderStatusBadge (this phase) rather
 * than redefining status labels/icons/colors a second time. If the
 * backend's status enum changes, updating OrderStatusBadge's config
 * automatically updates this timeline too.
 * 
 * DATA SOURCE — TWO MODES SUPPORTED:
 * 1. If the backend provides `order.statusHistory` (array of
 *    { status, timestamp }), the timeline renders EXACTLY that history
 *    — this is the accurate, backend-driven mode.
 * 2. If `statusHistory` is absent (many simpler Order backends only
 *    store the CURRENT status, not a full history), this component
 *    falls back to showing the standard lifecycle steps up to the
 *    order's current status as "completed" and the rest as "pending",
 *    without fabricating timestamps for steps we have no data for.
 * 
 * This graceful fallback means the component doesn't assume backend
 * capabilities we haven't verified (per Phase 14's "inspect the
 * backend first" instruction) while still being useful either way.
 * 
 * Props:
 * - order: { status, statusHistory? }
 */

import { Check } from "lucide-react";
import { ORDER_STATUS_CONFIG } from "../OrderStatusBadge/OrderStatusBadge";

// Standard forward-progression order (cancelled is handled separately,
// as it's a terminal branch, not a step in this sequence)
const LIFECYCLE_STEPS = ["confirmed", "processing", "shipped", "delivered"];

export const OrderTimeline = ({ order }) => {
  if (!order) return null;

  // Cancelled orders get a simple terminal message instead of a
  // progression, since "cancelled" isn't a step after "delivered"
  if (order.status === "cancelled") {
    const config = ORDER_STATUS_CONFIG.cancelled;
    const Icon = config.icon;
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Order Status
        </h3>
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <Icon size={18} />
          <span className="text-sm font-medium">This order was cancelled</span>
        </div>
      </div>
    );
  }

  const formatDate = (isoString) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mode 1: backend-provided history (accurate timestamps)
  const hasHistory = order.statusHistory && order.statusHistory.length > 0;

  const steps = hasHistory
    ? order.statusHistory.map((entry) => ({
        status: entry.status,
        timestamp: entry.timestamp,
        completed: true,
      }))
    : LIFECYCLE_STEPS.map((status, index) => {
        const currentIndex = LIFECYCLE_STEPS.indexOf(order.status);
        return {
          status,
          timestamp: null,
          completed: index <= currentIndex,
        };
      });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Order Status
      </h3>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const config =
            ORDER_STATUS_CONFIG[step.status] || ORDER_STATUS_CONFIG.confirmed;
          const Icon = config.icon;
          const isLast = index === steps.length - 1;
          const formattedTime = formatDate(step.timestamp);

          return (
            <div key={`${step.status}-${index}`} className="flex gap-3">
              {/* Icon + connecting line */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.completed
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  }`}
                >
                  {step.completed ? <Check size={14} /> : <Icon size={14} />}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[24px] ${
                      step.completed
                        ? "bg-green-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>

              {/* Label + timestamp */}
              <div className={`pb-4 ${isLast ? "pb-0" : ""}`}>
                <p
                  className={`text-sm font-medium ${
                    step.completed
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {config.label}
                </p>
                {formattedTime && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formattedTime}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};