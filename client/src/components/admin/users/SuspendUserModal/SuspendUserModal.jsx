/**
 * FILE: src/components/admin/users/SuspendUserModal/SuspendUserModal.jsx
 *
 * ============================================================================
 * SuspendUserModal — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The confirmation gate for suspending a user account. Opens when
 * adminUsers.store.js's `actionModal.type === "suspend"`. Fetches the
 * target user's display info via useAdminUserDetail(userId), same
 * self-sufficient pattern as DeleteUserModal.
 *
 * WHY SUSPEND/ACTIVATE SHARE ONE MUTATION HOOK, TWO MODAL FILES:
 * Both call useSetUserStatus() (user.service.js#setUserStatus, PATCH
 * /users/:id/status) with opposite `status` values. They're still two
 * separate FILES rather than one "StatusModal" with a mode prop, because
 * their copy, icon, and color language are meaningfully different
 * (Suspend is a warning/red action; Activate is a positive/green one) —
 * splitting keeps each file's JSX simple instead of branching on a mode
 * prop throughout.
 *
 * DESTRUCTIVE ACTION REQUIREMENTS (per brief): confirmation dialog (this
 * component), loading state (`isPending`), rollback on failure (nothing
 * optimistic — see DeleteUserModal's header for the same reasoning),
 * inline error surfaced verbatim from the backend.
 *
 * PRODUCTION-READY BECAUSE:
 * - Backdrop click and Escape both close (never suspend)
 * - Self-contained, no unverified shared Modal import
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect } from "react";
import { Ban, X } from "lucide-react";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";
import { useAdminUserDetail, useSetUserStatus } from "../../../../hooks/useAdminUsers";

const SuspendUserModal = () => {
  const actionModal = useAdminUsersStore((s) => s.actionModal);
  const closeActionModal = useAdminUsersStore((s) => s.closeActionModal);
  const isOpen = actionModal.type === "suspend";
  const userId = actionModal.userId;

  const { user } = useAdminUserDetail(isOpen ? userId : null);
  const { mutate: setStatus, isPending, isError, error, reset } = useSetUserStatus();

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

  const handleConfirm = () => {
    setStatus({ id: userId, status: "suspended" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-user-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
          <Ban className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 id="suspend-user-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
          Suspend {user?.name ?? "this user"}?
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          They'll be signed out and unable to log in until reactivated.
          Their data is preserved.
        </p>

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
            disabled={isPending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Suspending..." : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspendUserModal;