/**
 * src/pages/account/ProfilePage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Read-only profile view at route /account/profile — distinct from
 * AccountDashboardPage (which shows a condensed overview) in that this
 * page is dedicated purely to profile details, reached via
 * AccountSidebar's "Profile" link. Editing is intentionally NOT inline
 * here — it links out to EditProfilePage (this phase), keeping
 * "view" and "edit" as separate, single-responsibility pages rather
 * than one page juggling both a display and an edit mode.
 * 
 * BACKEND INTEGRATION:
 * - GET /users/profile (via useProfile, this phase)
 * 
 * REUSE:
 * - AccountLayout, ProfileCard, AccountSkeleton (this phase)
 */

import { Link } from "react-router-dom";
import { AlertCircle, Edit3 } from "lucide-react";
import { useProfile } from "../../hooks/useAccount";
import { AccountLayout, ProfileCard, AccountSkeleton } from "../../components/account";

export const ProfilePage = () => {
  const { data: profile, isLoading, isError, error } = useProfile();

  return (
    <AccountLayout title="Profile">
      {isLoading && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <AccountSkeleton variant="card" />
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">
              Unable to load profile
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {error?.message || "Something went wrong"}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && profile && (
        <div className="space-y-4">
          <ProfileCard profile={profile} />
          <Link
            to="/account/edit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Edit3 size={16} />
            Edit Profile
          </Link>
        </div>
      )}
    </AccountLayout>
  );
};