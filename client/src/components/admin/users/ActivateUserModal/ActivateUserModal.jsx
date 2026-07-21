/**
 * FILE: src/components/admin/users/ActivateUserModal/ActivateUserModal.jsx
 *
 * ============================================================================
 * ActivateUserModal — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The confirmation gate for reactivating a suspended user account. Opens
 * when adminUsers.store.js's `actionModal.type === "activate"`. Same
 * self-sufficient useAdminUserDetail(userId) pattern as its siblings —
 * see SuspendUserModal's header for why this is a separate file rather
 * than a mode-prop branch on one shared component.
 *
 * WHY THIS STILL GETS A CONFIRMATION MODAL (it's not destructive):
 * Reactivating an account restores their ability to log in and act on the
 * platform — while not "destructive" in the data-loss sense, it's still a
 * deliberate access-control decision worth an explicit confirm, consistent
 * with treating every account-status change as a considered action rather
 * than a stray-click risk.
 *
 * PRODUCTION-READY BECAUSE:
 * - Backdrop click and Escape both close
 * - Self-contained, no unverified shared Modal import
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";
import { useAdminUserDetail } from "../../../../hooks/useAdminUsers";
import { useSetUserStatus } from "../../../../hooks/useAdminUsers";

const ActivateUserModal = () => {
  const actionModal = useAdminUsersStore((s) => s.actionModal);
  const closeActionModal = useAdminUsersStore((s) => s.closeActionModal);
  const isOpen = actionModal.type === "activate";
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
    setStatus({ id: userId, status: "active" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activate-user-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>

        <h2 id="activate-user-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
          Activate {user?.name ?? "this user"}?
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          They'll immediately be able to log in and use their account again.
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
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Activating..." : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivateUserModal;