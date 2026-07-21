/**
 * FILE: src/components/admin/users/UserEmpty/UserEmpty.jsx
 *
 * ============================================================================
 * UserEmpty — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders when useAdminUsersList() resolves with zero users. Unlike
 * ProductsEmpty/CategoriesEmpty, there is NO "Add User" CTA here — admins
 * don't create customer accounts (users self-register via Phase 2's
 * signup flow), so an empty result is ALWAYS a search/filter mismatch,
 * never a "nothing exists yet, go create one" state. This is a genuine,
 * deliberate simplification versus the sibling Empty components, not an
 * oversight.
 *
 * REUSES:
 * `hasActiveFilters` is derived from the same adminUsers.store.js fields
 * UserSearch/UserFilters already write to.
 *
 * PRODUCTION-READY BECAUSE:
 * - Dark mode via `dark:` classes (Convention #6)
 * - "Clear filters" calls the store's existing `resetFilters()`
 */

import { SearchX } from "lucide-react";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";

const UserEmpty = () => {
  const search = useAdminUsersStore((s) => s.search);
  const status = useAdminUsersStore((s) => s.status);
  const role = useAdminUsersStore((s) => s.role);
  const verified = useAdminUsersStore((s) => s.verified);
  const resetFilters = useAdminUsersStore((s) => s.resetFilters);

  const hasActiveFilters = Boolean(search || status || role || verified);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <SearchX className="h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {hasActiveFilters
          ? "No users match your search or filters."
          : "No users found."}
      </p>
      {hasActiveFilters && (
        <button
          onClick={resetFilters}
          className="text-sm font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default UserEmpty;