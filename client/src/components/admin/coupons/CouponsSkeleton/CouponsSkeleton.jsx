/**
 * FILE: src/components/admin/coupons/CouponsSkeleton/CouponsSkeleton.jsx
 *
 * ============================================================================
 * CouponsSkeleton — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Table-row loading skeleton for the admin Coupons table, sibling to
 * ProductsSkeleton/CategoriesSkeleton/UserSkeleton — same shimmer
 * technique, columns reshaped for coupon rows (code, discount, usage,
 * status, actions — no image/avatar column at all, since coupons have no
 * visual asset).
 *
 * PRODUCTION-READY BECAUSE:
 * - `rows` prop matches the active page size, avoiding layout jump when
 *   real data swaps in
 * - Dark mode via `dark:` classes (Convention #6)
 */

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-gray-700" aria-hidden="true">
    <td className="p-3">
      <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
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

export const CouponsSkeleton = ({ rows = 5 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </>
);

export default CouponsSkeleton;
