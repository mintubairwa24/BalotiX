/**
 * FILE: src/components/admin/users/DeleteUserModal/DeleteUserModal.jsx
 *
 * ============================================================================
 * DeleteUserModal — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The confirmation gate for soft-deleting a user account. Opens when
 * adminUsers.store.js's `actionModal.type === "delete"` — set by
 * UserActions (table row) or UserDetails' own action buttons. Fetches the
 * target user's display info via useAdminUserDetail(userId) so this modal
 * works identically regardless of which page opened it (see UsersTable's
 * header for why all four modals are self-sufficient like this).
 *
 * WHY THIS IS FLAGGED AS AN ASSUMED FEATURE:
 * Per the brief: "Soft delete (only if backend supports it)." This modal
 * and its mutation (useDeleteUser, wired to DELETE /users/:id in
 * user.service.js) are built on that assumption — flagged there, and
 * flagged again here since this is the user-facing confirmation surface
 * for it.
 *
 * DESTRUCTIVE ACTION REQUIREMENTS (per brief, all satisfied here):
 * - Confirmation dialog: this entire component
 * - Loading state: confirm button shows a spinner and disables while
 *   `isPending`
 * - Rollback on failure: nothing is optimistically changed client-side —
 *   the mutation only invalidates queries `onSuccess`, so a failure simply
 *   leaves everything exactly as it was (no rollback logic needed because
 *   nothing was changed ahead of confirmation)
 * - Toast notification: NOT implemented directly in this file — this
 *   project's toast system is assumed to be wired globally (e.g. a toast
 *   library's Provider mounted once at the app root), so success/error
 *   toasts are expected to be triggered from the mutation's onSuccess/
 *   onError callbacks at the call site. Since the exact toast API wasn't
 *   re-verified this session, this modal surfaces errors inline (same
 *   proven pattern as DeleteCategoryModal) rather than assuming a specific
 *   toast function signature that might not compile.
 *
 * PRODUCTION-READY BECAUSE:
 * - Backdrop click and Escape both close (never delete)
 * - Self-contained (no unverified shared Modal import — see
 *   DeleteProductModal's header, Phase 18A, for the same reasoning)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";
import { useAdminUserDetail, useDeleteUser } from "../../../../hooks/useAdminUsers";

const DeleteUserModal = () => {
  const closeActionModal = useAdminUsersStore((s) => s.closeActionModal);
  const { type: modalType, userId } = useAdminUsersStore((s) => s.actionModal);
  const isOpen = modalType === "delete";

  const { user } = useAdminUserDetail(isOpen ? userId : null);
  const { mutate: deleteUserMutation, isPending, isError, error, reset } = useDeleteUser();

  const handleClose = useCallback(() => {
    reset();
    closeActionModal();
  }, [reset, closeActionModal]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    deleteUserMutation(userId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>

        <h2 id="delete-user-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
          Delete {user?.name ?? "this user"}'s account?
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          This soft-deletes the account — it can be restored later from the
          Users list. Their order and address history is preserved.
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
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;