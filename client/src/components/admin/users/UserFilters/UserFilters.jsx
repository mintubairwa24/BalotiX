/**
 * FILE: src/components/admin/users/UserFilters/UserFilters.jsx
 *
 * ============================================================================
 * UserFilters — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Three dropdowns — status, role, verification — narrowing the admin user
 * table via adminUsers.store.js, which useAdminUsersList() reads directly.
 * Exact sibling of ProductFilters/CategoryFilters, but with no data-fetch
 * dependency of its own (status/role/verified are fixed enums, unlike
 * category's parent dropdown which needed useCategories()).
 *
 * WHY THESE THREE, PER THE BRIEF'S EXAMPLES:
 * "Active users / Suspended users / Verified / Unverified / Role" map
 * directly to `status`, `verified`, and `role` in adminUsers.store.js.
 * "Registration date" (also listed in the brief) is NOT implemented here
 * — a date-range filter needs a richer UI (date pickers, range validation)
 * that would meaningfully bulk up this component beyond a simple dropdown
 * row; flagged as a reasonable, isolated follow-up rather than bolted on
 * awkwardly here.
 *
 * PRODUCTION-READY BECAUSE:
 * - Every change goes through the store's setters, which already reset
 *   `page` to 1
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useAdminUsersStore } from "../../../../store/adminUsers.store";

const selectClasses =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200";

export const UserFilters = () => {
  const status = useAdminUsersStore((s) => s.status);
  const setStatus = useAdminUsersStore((s) => s.setStatus);
  const role = useAdminUsersStore((s) => s.role);
  const setRole = useAdminUsersStore((s) => s.setRole);
  const verified = useAdminUsersStore((s) => s.verified);
  const setVerified = useAdminUsersStore((s) => s.setVerified);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Filter by account status"
        className={selectClasses}
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </select>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        aria-label="Filter by role"
        className={selectClasses}
      >
        <option value="">All Roles</option>
        <option value="customer">Customer</option>
        <option value="admin">Admin</option>
      </select>

      <select
        value={verified}
        onChange={(e) => setVerified(e.target.value)}
        aria-label="Filter by verification status"
        className={selectClasses}
      >
        <option value="">All Verification</option>
        <option value="verified">Verified</option>
        <option value="unverified">Unverified</option>
      </select>
    </div>
  );
};

export default UserFilters;