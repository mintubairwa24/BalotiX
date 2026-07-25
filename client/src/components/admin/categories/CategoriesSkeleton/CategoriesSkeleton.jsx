/**
 * FILE: src/components/admin/categories/CategoriesSkeleton/CategoriesSkeleton.jsx
 *
 * ============================================================================
 * CategoriesSkeleton — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Table-row loading skeleton for the admin Categories table, exact sibling
 * of ProductsSkeleton (Phase 18A) — same shimmer technique, columns
 * reshaped for category rows (image, name+parent, status, actions — no
 * price/stock columns).
 *
 * WHY NOT REUSE ProductsSkeleton DIRECTLY:
 * Same reasoning already documented for ProductsSkeleton vs AdminSkeleton
 * — shared visual language, separate file because the column shape is
 * genuinely different (categories have a parent-name subtext where
 * products have a category-name subtext; no price/stock columns at all).
 *
 * PRODUCTION-READY BECAUSE:
 * - `rows` prop matches the active page size, avoiding layout jump when
 *   real data swaps in
 * - Dark mode via `dark:` classes (Convention #6)
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

export const CategoriesSkeleton = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </>
);

export default CategoriesSkeleton;