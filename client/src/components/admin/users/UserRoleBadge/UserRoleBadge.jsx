/**
 * FILE: src/components/admin/users/UserRoleBadge/UserRoleBadge.jsx
 *
 * ============================================================================
 * UserRoleBadge — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a user's role (customer/admin) as a small badge. Same
 * display-only reasoning as UserStatus — promoting a customer to admin is
 * a high-privilege action (see PROJECT_CONTEXT: admin accounts are
 * otherwise only ever created via a terminal seed script), so it is never
 * a single click. This badge is purely presentational; the actual change
 * happens through ChangeRoleModal (opened via UserActions), which
 * requires explicit confirmation.
 *
 * WHY A SEPARATE FILE FROM UserStatus (not one shared "Badge" component):
 * Status (active/suspended) and role (customer/admin) are two independent
 * axes of the same user — different colors, different meaning, different
 * mutation hook when changed. Keeping them as small, separate files is
 * consistent with this project's pattern of not merging unrelated
 * enums into one generic component (see RecentActivity vs. OrderStatusBadge,
 * Phase 17, for the same reasoning).
 *
 * PRODUCTION-READY BECAUSE:
 * - Purely presentational — no mutation, no loading state needed here
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { ShieldCheck, User as UserIcon } from "lucide-react";

const UserRoleBadge = ({ role }) => {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        isAdmin
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {isAdmin ? (
        <ShieldCheck className="h-3 w-3" />
      ) : (
        <UserIcon className="h-3 w-3" />
      )}
      {isAdmin ? "Admin" : "Customer"}
    </span>
  );
};

export default UserRoleBadge;