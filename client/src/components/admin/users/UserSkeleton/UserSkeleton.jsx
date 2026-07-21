/**
 * FILE: src/components/admin/users/UserSkeleton/UserSkeleton.jsx
 *
 * ============================================================================
 * UserSkeleton — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Loading-state component for both the Users table AND the User Details
 * page — two variants, same shimmer technique, following the exact
 * multi-variant pattern established by AdminSkeleton (Phase 17):
 *   - "row"    → table-row placeholders (avatar, name+email, role, status,
 *                actions) for UsersTable
 *   - "detail" → a profile-card-shaped placeholder for UserDetailsPage's
 *                first paint, before useAdminUserDetail() resolves
 *
 * WHY NOT REUSE ProductsSkeleton/CategoriesSkeleton:
 * Same reasoning already documented twice this project (Categories vs.
 * Products, Products vs. Dashboard) — shared shimmer language, separate
 * file because the column/section shapes are genuinely different (users
 * have avatar+role+status, not price+stock).
 *
 * PRODUCTION-READY BECAUSE:
 * - `rows` prop matches the active page size for the "row" variant,
 *   avoiding layout jump when real data swaps in
 * - Dark mode via `dark:` classes (Convention #6)
 */

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-gray-700" aria-hidden="true">
    <td className="p-3">
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="mb-2 h-3.5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-800" />
    </td>
    <td className="p-3">
      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
    </td>
    <td className="p-3">
      <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700" />
    </td>
  </tr>
);

const DetailSkeleton = () => (
  <div className="animate-pulse space-y-4" aria-hidden="true">
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
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

const UserSkeleton = ({ variant = "row", rows = 5 }) => {
  if (variant === "detail") return <DetailSkeleton />;

  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
};

export default UserSkeleton;