/**
 * FILE: src/components/admin/users/UserProfileCard/UserProfileCard.jsx
 *
 * ============================================================================
 * UserProfileCard — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The header card at the top of UserDetailsPage — avatar, name, email,
 * phone, registration date, verification status, account status, and
 * role, all in one glanceable block. This is the "who am I looking at"
 * summary; deeper sections (addresses, orders, activity) are separate
 * sibling components composed alongside it by UserDetails.
 *
 * REUSES:
 * UserAvatar (this phase), UserStatus, UserRoleBadge — the same badges
 * used in UsersTable's rows, so status/role read identically whether
 * glanced at in the table or read in detail here (Convention: one visual
 * language per concept across the feature).
 *
 * DATA SOURCE:
 * Receives `user` as a prop from UserDetails, which is the single place
 * calling useAdminUserDetail() — this card itself does no fetching
 * (Convention #3: pages/composition-roots fetch, presentational children
 * receive props).
 *
 * PRODUCTION-READY BECAUSE:
 * - Verification status shown with a clear check/x icon rather than only
 *   color, so it isn't perceivable by color alone
 * - Registration date formatted in a locale-appropriate way (en-IN, same
 *   convention as every other date/currency display in this project)
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { BadgeCheck, BadgeX, Mail, Phone, Calendar } from "lucide-react";
import  UserAvatar  from "../UserAvatar/UserAvatar";
import  UserStatus  from "../UserStatus/UserStatus";
import UserRoleBadge from "../UserRoleBadge/UserRoleBadge";

const formatDate = (isoString) =>
  isoString
    ? new Date(isoString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

const UserProfileCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar avatarUrl={user.avatarUrl} name={user.name} size="lg" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
              {user.name}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <UserRoleBadge role={user.role} />
              <UserStatus status={user.status} />
              {user.isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <BadgeX className="h-3.5 w-3.5" /> Unverified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 text-sm dark:border-gray-700 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Mail className="h-4 w-4 text-gray-400" />
          {user.email}
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Phone className="h-4 w-4 text-gray-400" />
          {user.phone || "—"}
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Calendar className="h-4 w-4 text-gray-400" />
          Joined {formatDate(user.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;