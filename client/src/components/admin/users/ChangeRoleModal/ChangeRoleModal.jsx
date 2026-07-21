/**
 * FILE: src/components/admin/users/ChangeRoleModal/ChangeRoleModal.jsx
 *
 * ============================================================================
 * ChangeRoleModal — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The confirmation gate for changing a user's role. Opens when
 * adminUsers.store.js's `actionModal.type === "changeRole"`. Unlike
 * Suspend/Activate/Delete (binary actions), role has more than one
 * possible target value, so this modal includes an explicit role
 * <select> defaulted to the user's CURRENT role — the admin must
 * consciously pick a different one before Confirm does anything, rather
 * than a single "yes/no" button implying one obvious outcome.
 *
 * WHY THIS IS FLAGGED AS AN ASSUMED FEATURE:
 * Per the brief: "Change user role (only if backend supports it)." This
 * modal and its mutation (useChangeUserRole, PATCH /users/:id/role) are
 * built on that assumption — flagged in user.service.js, flagged again
 * here.
 *
 * EXTRA GUARD FOR PROMOTING TO ADMIN:
 * Per PROJECT_CONTEXT, admin accounts have historically only ever been
 * created via a terminal seed script — never through any UI action. This
 * modal is the first UI surface that could grant admin privileges, so
 * Confirm is disabled until the selected role actually differs from the
 * current one AND, when promoting TO admin specifically, an extra inline
 * warning is shown (not a second modal — that would be excessive for an
 * already-confirmed dialog, just a clearly visible caution line).
 *
 * PRODUCTION-READY BECAUSE:
 * - Confirm is disabled when no role change is actually selected, so
 *   there's no confusing no-op submission
 * - Backdrop click and Escape both close
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useState } from "react";
import { ShieldCheck, X, AlertTriangle } from "lucide-react";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";
import { useAdminUserDetail, useChangeUserRole } from "../../../../hooks/useAdminUsers";

const ChangeRoleModal = () => {
  const actionModal = useAdminUsersStore((s) => s.actionModal);
  const closeActionModal = useAdminUsersStore((s) => s.closeActionModal);
  const isOpen = actionModal.type === "changeRole";
  const userId = actionModal.userId;

  const { user } = useAdminUserDetail(isOpen ? userId : null);
  const { mutate: changeRole, isPending, isError, error, reset } = useChangeUserRole();

  const [selectedRole, setSelectedRole] = useState("customer");

  useEffect(() => {
    if (isOpen && user?.role) setSelectedRole(user.role);
  }, [isOpen, user?.role]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    closeActionModal();
  };

  const hasChanged = user?.role && selectedRole !== user.role;
  const isPromotingToAdmin = hasChanged && selectedRole === "admin";

  const handleConfirm = () => {
    if (!hasChanged) return;
    changeRole({ id: userId, role: selectedRole });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-role-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>

        <h2 id="change-role-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
          Change role for {user?.name ?? "this user"}
        </h2>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
          Current role: <span className="font-medium">{user?.role ?? "—"}</span>
        </p>

        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="new-role">
          New Role
        </label>
        <select
          id="new-role"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="customer">Customer</option>
          <option value="admin">Admin</option>
        </select>

        {isPromotingToAdmin && (
          <p className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This grants full admin access, including this User Management
            module. Make sure this is intentional.
          </p>
        )}

        {isError && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error?.response?.data?.message ?? "Something went wrong. Please try again."}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || !hasChanged}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Confirm Change"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleModal;