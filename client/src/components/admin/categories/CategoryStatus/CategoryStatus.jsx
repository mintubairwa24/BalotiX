/**
 * FILE: src/components/admin/categories/CategoryStatus/CategoryStatus.jsx
 *
 * ============================================================================
 * CategoryStatus — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a category's active/inactive status as a colored badge, AND (per
 * the brief's "Status toggle if backend supports it") doubles as the
 * clickable control that flips it — via useToggleCategoryStatus(), which
 * hits the dedicated PATCH /categories/:id/status endpoint rather than a
 * full category update. Exact sibling of ProductStatus (Phase 18A).
 *
 * WHY NOT REUSE ProductStatus DIRECTLY:
 * Same reasoning already documented for RecentActivity/ProductStatus —
 * different domain, different mutation hook, different endpoint. A shared
 * "StatusToggle" component would need to abstract over which mutation hook
 * to call, adding indirection for a component this small; a small sibling
 * file is simpler and keeps each feature's status logic self-contained.
 *
 * WHY NOT TRUE OPTIMISTIC UPDATES:
 * Same reasoning as ProductStatus — a brief inline spinner while the
 * mutation is in flight felt safer for an admin-facing catalog control
 * than an instant flip that might silently roll back on error.
 *
 * PRODUCTION-READY BECAUSE:
 * - Click target is a real <button>, keyboard/screen-reader accessible
 * - Disabled while its own mutation is pending, preventing double-clicks
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { Loader2 } from "lucide-react";
import { useToggleCategoryStatus } from "../../../../hooks/useAdminCategories";

export const CategoryStatus = ({ categoryId, status }) => {
  const { mutate: toggleStatus, isPending } = useToggleCategoryStatus();
  const isActive = status === "active";

  return (
    <button
      onClick={() => toggleStatus({ id: categoryId, isActive: !isActive })}
      disabled={isPending}
      aria-label={isActive ? "Deactivate category" : "Activate category"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isActive
          ? "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:hover:bg-green-900"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
      }`}
    >
      {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
      {isActive ? "Active" : "Inactive"}
    </button>
  );
};

export default CategoryStatus;
