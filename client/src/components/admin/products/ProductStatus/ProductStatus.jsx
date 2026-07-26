/**
 * FILE: src/components/admin/products/ProductStatus/ProductStatus.jsx
 *
 * ============================================================================
 * ProductStatus — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a product's active/inactive status as a colored badge, AND (per
 * the brief's "Status toggle if backend supports it") doubles as the
 * clickable control that flips it — via useToggleProductStatus(), which
 * hits the dedicated PATCH /products/:id/status endpoint rather than a
 * full product update.
 *
 * WHY THIS ISN'T OrderStatusBadge REUSED:
 * Same reasoning already documented for RecentActivity in Phase 17 —
 * product status ("active"|"inactive", a simple boolean-backed toggle) is
 * a completely different domain and enum from Order status
 * (pending_payment|confirmed|shipped|...), which is a one-way progression
 * an admin doesn't casually click to change. Conflating the two into one
 * shared badge component would force awkward conditional logic into a file
 * that's supposed to be simple.
 *
 * WHY OPTIMISTIC-FEELING BUT NOT TRUE OPTIMISTIC UPDATES:
 * The badge shows a brief inline spinner state while the mutation is in
 * flight (`isPending`) rather than flipping instantly and rolling back on
 * error — for an admin-facing inventory control, a flash-then-maybe-revert
 * felt riskier than a half-second wait with clear pending feedback.
 *
 * PRODUCTION-READY BECAUSE:
 * - Click target is a real <button>, not a styled span — keyboard/
 *   screen-reader accessible
 * - Disabled while its own mutation is pending, preventing double-clicks
 *   from firing two PATCH requests
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Loader2 } from "lucide-react";
import { useToggleProductStatus } from "../../../../hooks/useAdminProducts";

const ProductStatus = ({ productId, status }) => {
  const { mutate: toggleStatus, isPending } = useToggleProductStatus();
  const isActive = status === "active";
  const label =
    status === "draft"
      ? "Draft"
      : status === "archived"
        ? "Archived"
        : isActive
          ? "Active"
          : "Inactive";
  const canToggle = status === "active" || status === "inactive";

  return (
    <button
      onClick={() => canToggle && toggleStatus({ id: productId, isActive: !isActive })}
      disabled={isPending || !canToggle}
      aria-label={isActive ? "Deactivate product" : "Activate product"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive
          ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
          : status === "draft"
            ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400 dark:hover:bg-amber-900"
            : status === "archived"
              ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
      }`}
    >
      {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      {label}
    </button>
  );
};

export default ProductStatus;
