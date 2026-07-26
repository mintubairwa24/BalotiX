/**
 * FILE: src/components/admin/users/UserStatus/UserStatus.jsx
 *
 * ============================================================================
 * UserStatus — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a user's account status (active/suspended) as a colored badge.
 *
 * WHY THIS IS DISPLAY-ONLY (unlike ProductStatus/CategoryStatus, which are
 * clickable one-step toggles):
 * Suspending or activating a CUSTOMER'S account is a materially different
 * kind of action than deactivating a product listing — it can lock a real
 * person out of their account and order history. The brief's own "USER
 * ACTIONS" section requires confirmation dialogs, loading state, rollback,
 * and toast notifications for every destructive action — a single-click
 * toggle badge would skip all of that. So status changes here route
 * through SuspendUserModal/ActivateUserModal (opened via UserActions),
 * and this badge is purely presentational — it reflects state, it doesn't
 * change it.
 *
 * PRODUCTION-READY BECAUSE:
 * - Purely presentational — no mutation, no loading state needed here
 * - Dark mode via `dark:` classes (Convention #6)
 */

const UserStatus = ({ status }) => {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isActive
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
      }`}
    >
      {isActive ? "Active" : "Suspended"}
    </span>
  );
};

export default UserStatus;