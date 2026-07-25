/**
 * FILE: src/components/admin/users/UsersTable/UsersTable.jsx
 *
 * ============================================================================
 * UsersTable — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the user list — column headers (with
 * click-to-sort), UserRow's, loading/error/empty states, pagination, and
 * all four action modals. Exact sibling of ProductsTable/CategoriesTable.
 *
 * WHY ALL FOUR ACTION MODALS ARE MOUNTED HERE:
 * SuspendUserModal, ActivateUserModal, ChangeRoleModal, and
 * DeleteUserModal all read their target from adminUsers.store.js's
 * `actionModal` slice and independently fetch whatever display data they
 * need (via useAdminUserDetail) rather than depending on props from this
 * table — so they work identically whether opened from a UserRow's
 * dropdown here, or (in UserDetailsPage) from that page's own action
 * buttons. Mounting all four here means every row's UserActions menu has
 * something to talk to; UserDetailsPage mounts its own copies for the
 * same reason.
 *
 * SORTING — REUSES BACKEND SORT:
 * Clicking a sortable header calls `setSort(field, nextOrder)` on
 * adminUsers.store.js, included in useAdminUsersList()'s queryKey and
 * GET /admin/users params. The backend does the actual sorting.
 *
 * PRODUCTION-READY BECAUSE:
 * - Loading state renders UserSkeleton inside the same <table> markup so
 *   headers stay visible during page/filter changes
 * - Error state gives an explicit retry rather than a silent empty table
 * - Accessible table: proper <th scope="col">, sort buttons are real
 *   <button>s reachable by keyboard
 */

import { ArrowUpDown, AlertCircle } from "lucide-react";
import { useAdminUsersList } from "../../../../hooks/useAdminUsers";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";
import UserRow from "../UserRow/UserRow";
import UserSkeleton from "../UserSkeleton/UserSkeleton";
import UserEmpty from "../UserEmpty/UserEmpty.jsx";
import UserPagination from "../UserPagination/UserPagination.jsx";
import SuspendUserModal from "../SuspendUserModal/SuspendUserModal.jsx";
import ActivateUserModal from "../ActivateUserModal/ActivateUserModal.jsx";
import ChangeRoleModal from "../ChangeRoleModal/ChangeRoleModal.jsx";
import DeleteUserModal from "../DeleteUserModal/DeleteUserModal.jsx";

const COLUMNS = [
  { key: "avatar", label: "", sortable: false },
  { key: "name", label: "User", sortable: true },
  { key: "role", label: "Role", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "actions", label: "", sortable: false },
];

// ARCHITECTURAL FIX: To resolve the cascade of import/export errors, all components
// are being standardized to use NAMED EXPORTS. This component was previously using a
// default export. This change makes it a named export, consistent with the rest of
// the application. Any file that imports this component must now use `import { UsersTable } from ...`.
export const UsersTable = () => {
  const { users, pagination, isLoading, isError, error, refetch } =
    useAdminUsersList();

  const sortBy = useAdminUsersStore((s) => s.sortBy);
  const sortOrder = useAdminUsersStore((s) => s.sortOrder);
  const setSort = useAdminUsersStore((s) => s.setSort);

  const handleSortClick = (key) => {
    const nextOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSort(key, nextOrder);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="p-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSortClick(col.key)}
                      className="flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      {col.label}
                      <ArrowUpDown
                        className={`h-3 w-3 ${
                          sortBy === col.key ? "text-indigo-600 dark:text-indigo-400" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && <UserSkeleton variant="row" rows={pagination?.limit ?? 5} />}

            {!isLoading &&
              !isError &&
              users.map((user) => <UserRow key={user._id} user={user} />)}
          </tbody>
        </table>
      </div>

      {isError && (
        <div className="flex items-center justify-between p-6 text-sm text-red-700 dark:text-red-300">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error?.message ?? "Couldn't load users."}
          </span>
          <button
            onClick={refetch}
            className="font-medium underline underline-offset-2 hover:text-red-800 dark:hover:text-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && users.length === 0 && <UserEmpty />}

      {!isLoading && !isError && users.length > 0 && (
        <div className="p-4">
          <UserPagination pagination={pagination} />
        </div>
      )}

      <SuspendUserModal />
      <ActivateUserModal />
      <ChangeRoleModal />
      <DeleteUserModal />
    </div>
  );
};

export default UsersTable;