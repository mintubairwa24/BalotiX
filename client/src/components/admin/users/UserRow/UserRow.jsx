/**
 * FILE: src/components/admin/users/UserRow/UserRow.jsx
 *
 * ============================================================================
 * UserRow — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders a single user's `<tr>` inside UsersTable — avatar, name+email,
 * UserRoleBadge, UserStatus, and UserActions. Exact sibling of
 * ProductRow/CategoryRow.
 *
 * REUSES:
 * UserAvatar (this phase, itself wrapping Phase 15's ProfileAvatar),
 * UserRoleBadge, UserStatus, UserActions (all this phase) are composed
 * here rather than duplicated inline.
 *
 * PRODUCTION-READY BECAUSE:
 * - Long names/emails truncate with `title` tooltip rather than breaking
 *   row height
 * - Avatar carries a small status dot (via UserAvatar's `status` prop) as
 *   a quick visual scan aid, in addition to the explicit UserStatus badge
 *   — redundant on purpose (Convention: never make status perceivable
 *   only one way)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import UserAvatar  from "../UserAvatar/UserAvatar";
import  UserRoleBadge  from "../UserRoleBadge/UserRoleBadge";
import UserStatus  from "../UserStatus/UserStatus";
import  UserActions  from "../UserActions/UserActions";

const UserRow = ({ user }) => {
  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
      <td className="p-3">
        <UserAvatar avatarUrl={user.avatarUrl} name={user.name} size="sm" status={user.status} />
      </td>
      <td className="max-w-[240px] p-3">
        <p
          title={user.name}
          className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {user.name}
        </p>
        <p title={user.email} className="truncate text-xs text-gray-500 dark:text-gray-400">
          {user.email}
        </p>
      </td>
      <td className="p-3">
        <UserRoleBadge role={user.role} />
      </td>
      <td className="p-3">
        <UserStatus status={user.status} />
      </td>
      <td className="p-3">
        <UserActions user={user} />
      </td>
    </tr>
  );
};

export default UserRow;