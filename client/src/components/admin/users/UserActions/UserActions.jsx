/**
 * FILE: src/components/admin/users/UserActions/UserActions.jsx
 *
 * ============================================================================
 * UserActions — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The per-row action control for the Users table. Unlike Products/
 * Categories (2 actions: edit, delete), Users have up to 5 possible
 * actions (View, Edit, Suspend/Activate, Change Role, Delete/Restore) —
 * a row of 5 icon buttons would be visually noisy and cramped at typical
 * table widths, so this renders a dropdown menu instead, matching common
 * enterprise-admin-table conventions for row action counts this size.
 *
 * WHY EVERY DESTRUCTIVE/SENSITIVE ACTION ONLY OPENS A MODAL:
 * Exactly like ProductActions/CategoryActions, clicking a menu item never
 * fires a mutation directly — it calls `openActionModal(type, userId)` on
 * adminUsers.store.js. The actual mutation lives in the corresponding
 * modal (SuspendUserModal/ActivateUserModal/ChangeRoleModal/
 * DeleteUserModal), which is the single confirmation gate for that action,
 * per the brief's explicit requirement that every destructive action has
 * a confirmation dialog.
 *
 * WHY RESTORE FIRES DIRECTLY (no RestoreUserModal — there isn't one in
 * this phase's file list, and there doesn't need to be): every OTHER
 * action here is either destructive (Suspend, Delete) or high-privilege
 * (Change Role) — Restore is neither. It only REVERSES a prior soft
 * delete, returning an account to normal. Gating it behind the same
 * confirmation ceremony as the actions that got it into that state in the
 * first place would add friction to what is, in effect, an "undo." So
 * Restore calls useRestoreUser() directly from this menu, with its own
 * pending/toast feedback — no separate modal file was invented for it.
 *
 * CONDITIONAL MENU ITEMS BASED ON CURRENT STATE:
 * Suspend only shows for active users, Activate only for suspended ones
 * (never both at once — showing an already-true action doesn't make
 * sense). Delete vs. Restore follows the same logic based on `isDeleted`.
 * This keeps the menu from ever presenting a contradictory or no-op action.
 *
 * PRODUCTION-READY BECAUSE:
 * - Menu closes on outside click and Escape (no dangling open menus)
 * - Every item has proper `role="menuitem"` semantics for screen readers
 * - Destructive item (Delete) is visually distinct (red) from the rest
 * - Restore shows an inline pending state on its own menu item so a
 *   double-click can't fire two restores
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  MoreVertical,
  Eye,
  Pencil,
  Ban,
  CheckCircle,
  ShieldCheck,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";
import { useRestoreUser } from "../../../../hooks/useAdminUsers";

const UserActions = ({ user }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { mutate: restoreUser, isPending: isRestoring } = useRestoreUser();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClasses =
    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700";

  const handleAction = (type) => {
    // Use getState() for a "fire-and-forget" action call. This is more robust
    // than selecting the action via a hook in a component that's rendered
    // many times in a list, as it avoids potential hook-related stale closures.
    useAdminUsersStore.getState().openActionModal(type, user._id);
    setOpen(false);
  };

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <Link
            to={`/admin/users/${user._id}`}
            role="menuitem"
            className={itemClasses}
            onClick={() => setOpen(false)}
          >
            <Eye className="h-4 w-4" /> View Profile
          </Link>
          <Link
            to={`/admin/users/${user._id}/edit`}
            role="menuitem"
            className={itemClasses}
            onClick={() => setOpen(false)}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>

          {user.status === "active" ? (
            <button role="menuitem" className={itemClasses} onClick={() => handleAction("suspend")}>
              <Ban className="h-4 w-4" /> Suspend
            </button>
          ) : (
            <button role="menuitem" className={itemClasses} onClick={() => handleAction("activate")}>
              <CheckCircle className="h-4 w-4" /> Activate
            </button>
          )}

          <button role="menuitem" className={itemClasses} onClick={() => handleAction("changeRole")}>
            <ShieldCheck className="h-4 w-4" /> Change Role
          </button>

          {user.isDeleted ? (
            <button
              role="menuitem"
              disabled={isRestoring}
              className={`${itemClasses} disabled:cursor-not-allowed disabled:opacity-60`}
              onClick={() => {
                restoreUser(user._id);
                setOpen(false);
              }}
            >
              {isRestoring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Restore
            </button>
          ) : (
            <button
              role="menuitem"
              className={`${itemClasses} text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950`}
              onClick={() => handleAction("delete")}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserActions;