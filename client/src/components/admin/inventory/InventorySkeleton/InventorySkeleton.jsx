/**
 * FILE: src/components/admin/inventory/InventorySkeleton/InventorySkeleton.jsx
 *
 * ============================================================================
 * InventorySkeleton — Phase 18F
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Loading-state component for both the Inventory table AND
 * InventoryDetailsPage — two variants, same shimmer technique, following
 * the multi-variant pattern established by UserSkeleton (Phase 18C):
 *   - "row"    → table-row placeholders (thumbnail, name+SKU, stock,
 *                status, actions) for InventoryTable
 *   - "detail" → a card-shaped placeholder for InventoryDetailsPage's
 *                first paint
 *
 * PRODUCTION-READY BECAUSE:
 * - `rows` prop matches the active page size for the "row" variant
 * - Dark mode via `dark:` classes (Convention #6)
 */

export const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-gray-700" aria-hidden="true">
    <td className="p-3">
      <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="mb-2 h-3.5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
    </td>
    <td className="p-3">
      <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
  </tr>
);

export const DetailSkeleton = () => (
  <div className="animate-pulse space-y-4" aria-hidden="true">
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1">
        <div className="mb-2 h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-gray-200 dark:bg-gray-700" />
      ))}
    </div>
  </div>
);

export const InventorySkeleton = ({ variant = "row", rows = 5 }) => {
  if (variant === "detail") return <DetailSkeleton />;

  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
};

export default InventorySkeleton;