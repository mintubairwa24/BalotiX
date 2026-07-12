/**
 * src/pages/account/AccountDashboardPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * The account landing page at route /account. Thin page component that
 * fetches the profile once (useProfile, this phase) and hands it to
 * AccountOverview (this phase) inside AccountLayout (this phase) —
 * consistent with every other *Page component in NexCart being a
 * data-fetching + state-routing shell around presentational content
 * components.
 * 
 * BACKEND INTEGRATION:
 * - GET /users/profile (user.service.js, this phase, via useProfile)
 * 
 * REUSE:
 * - AccountLayout, AccountOverview, AccountSkeleton (all this phase)
 */

import { AlertCircle } from "lucide-react";
import { useProfile } from "../../hooks/useAccount";
import { AccountLayout, AccountOverview, AccountSkeleton } from "../../components/account";

export const AccountDashboardPage = () => {
  const { data: profile, isLoading, isError, error } = useProfile();

  return (
    <AccountLayout title="My Account">
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
              Unable to load account
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {error?.message || "Something went wrong"}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && profile && (
        <AccountOverview profile={profile} />
      )}
    </AccountLayout>
  );
};