/**
 * FILE: src/components/admin/products/ProductsSkeleton/ProductsSkeleton.jsx
 *
 * ============================================================================
 * ProductsSkeleton — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS (and isn't just AdminSkeleton reused):
 * AdminSkeleton (Phase 17) only ships "stats" / "activity" / "page"
 * variants shaped for the dashboard — none of them match a data TABLE with
 * thumbnail + name + category + price + status + actions columns. Rather
 * than bolt a fifth, table-shaped variant onto AdminSkeleton (which would
 * couple the dashboard's skeleton file to the products feature), this is a
 * small sibling component — same shimmer technique, different shape. This
 * mirrors the exact reasoning already used for RecentActivity vs
 * OrderStatusBadge in Phase 17: shared visual language, separate file
 * because the underlying shape is genuinely different.
 *
 * PRODUCTION-READY BECAUSE:
 * - `rows` prop matches whatever page size is active, so the skeleton's row
 *   count doesn't mismatch the real table once data loads (no layout jump)
 * - Dark mode via `dark:` classes (Convention #6)
 * - Column widths approximate the real ProductRow layout closely enough to
 *   avoid CLS when real data swaps in
 */

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-gray-700" aria-hidden="true">
    <td className="p-3">
      <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="mb-2 h-3.5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
    </td>
    <td className="p-3">
      <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="h-3.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
  </tr>
);

const ProductsSkeleton = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </>
);

export default ProductsSkeleton;