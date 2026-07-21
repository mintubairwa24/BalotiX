/**
 * FILE: src/components/admin/users/UserDetails/UserDetails.jsx
 *
 * ============================================================================
 * UserDetails — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The composition root for the user detail view — the ONE place that
 * calls useAdminUserDetail(userId) and hands data down to UserProfileCard,
 * UserStatistics, UserOrdersSummary, UserAddressCard (mapped over
 * addresses), and UserActivityTimeline. Same "fetch once, compose many
 * presentational children" pattern as DashboardOverview (Phase 17) and
 * ProductsTable/CategoriesTable (Phase 18A/18B).
 *
 * WHY ACTION BUTTONS + ALL FOUR MODALS ARE HERE TOO:
 * UserDetailsPage needs the same Suspend/Activate/Change Role/Delete
 * actions UserActions offers in the table — an admin looking at someone's
 * full profile is a natural place to act on it, not just from a row menu.
 * Rather than duplicate UserActions' dropdown UI here, this renders
 * explicit labeled buttons (more appropriate for a detail page's spacious
 * layout than a compact dropdown) that call the SAME
 * `openActionModal(type, userId)` store action UserActions uses — and
 * mounts its own copies of the four modals, exactly as UsersTable does,
 * because both screens are independent entry points into the same
 * confirmation-gated action flow (see UsersTable's header for why the
 * modals are self-sufficient and safe to mount in more than one place).
 *
 * PRODUCTION-READY BECAUSE:
 * - Distinguishes loading / error / success states explicitly
 *   (Convention #7)
 * - Addresses section renders an explicit empty state rather than nothing
 *   when a user has none saved
 * - Action buttons are hidden entirely for the currently-restricted
 *   states where they'd be meaningless (e.g. no Suspend button shown for
 *   an already-suspended account — mirrors UserActions' same conditional
 *   logic)
 */

import { Link } from "react-router-dom";
import { Ban, CheckCircle, ShieldCheck, Trash2, MapPin, Pencil } from "lucide-react";
import { useAdminUserDetail } from "../../../../hooks/useAdminUsers";
import { useAdminUsersStore } from "../../../../store/adminUsers.store";
import UserProfileCard from "../UserProfileCard/UserProfileCard";
import UserStatistics from "../UserStatistics/UserStatistics";
import UserOrdersSummary from "../UserOrdersSummary/UserOrdersSummary";
import UserAddressCard from "../UserAddressCard/UserAddressCard";
import UserActivityTimeline from "../UserActivityTimeline/UserActivityTimeline";
import UserSkeleton from "../UserSkeleton/UserSkeleton";
import SuspendUserModal from "../SuspendUserModal/SuspendUserModal";
import ActivateUserModal from "../ActivateUserModal/ActivateUserModal";
import ChangeRoleModal from "../ChangeRoleModal/ChangeRoleModal";
import DeleteUserModal from "../DeleteUserModal/DeleteUserModal";

const UserDetails = ({ userId }) => {
  const { user, addresses, orderSummary, activity, isLoading, isError, error } =
    useAdminUserDetail(userId);
  const actionButtonClasses =
    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition";

  if (isLoading) {
    return (
      <div className="p-1">
        <UserSkeleton variant="detail" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        {error?.message ?? "Couldn't load this user. They may have been deleted."}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <UserProfileCard user={user} />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          to={`/admin/users/${user._id}/edit`}
          className={`${actionButtonClasses} border-gray-200 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700`}
        >
          <Pencil className="h-4 w-4" /> Edit
        </Link>
        {user.status === "active" ? (
          <button
            onClick={() => useAdminUsersStore.getState().openActionModal("suspend", user._id)}
            className={`${actionButtonClasses} border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950`}
          >
            <Ban className="h-4 w-4" /> Suspend
          </button>
        ) : (
          <button
            onClick={() => useAdminUsersStore.getState().openActionModal("activate", user._id)}
            className={`${actionButtonClasses} border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950`}
          >
            <CheckCircle className="h-4 w-4" /> Activate
          </button>
        )}
        <button
          onClick={() => useAdminUsersStore.getState().openActionModal("changeRole", user._id)}
          className={`${actionButtonClasses} border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950`}
        >
          <ShieldCheck className="h-4 w-4" /> Change Role
        </button>
        {!user.isDeleted && (
          <button
            onClick={() => useAdminUsersStore.getState().openActionModal("delete", user._id)}
            className={`${actionButtonClasses} border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950`}
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        )}
      </div>

      <UserStatistics user={user} />
      <UserOrdersSummary orderSummary={orderSummary} />

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Addresses
        </h2>
        {addresses.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4" /> No saved addresses.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <UserAddressCard key={address._id} address={address} />
            ))}
          </div>
        )}
      </div>

      <UserActivityTimeline activity={activity} />

      <SuspendUserModal />
      <ActivateUserModal />
      <ChangeRoleModal />
      <DeleteUserModal />
    </div>
  );
};

export default UserDetails;