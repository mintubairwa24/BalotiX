/**
 * src/pages/account/SecurityPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Security settings page at route /account/security. Thin shell
 * fetching the profile (needed for email/verification display) and
 * handing it to SecuritySettings (this phase), which owns the actual
 * change-password flow and email-verification display.
 * 
 * BACKEND INTEGRATION:
 * - GET /users/profile (for email/emailVerified display)
 * - POST /auth/change-password (via SecuritySettings -> useChangePassword)
 * 
 * REUSE:
 * - AccountLayout, SecuritySettings, AccountSkeleton (this phase)
 */

import { AlertCircle } from "lucide-react";
import { useProfile } from "../../hooks/useAccount";
import { AccountLayout, SecuritySettings, AccountSkeleton } from "../../components/account";

export const SecurityPage = () => {
  const { data: profile, isLoading, isError, error } = useProfile();

  return (
    <AccountLayout title="Security Settings">
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
              Unable to load security settings
            </h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {error?.message || "Something went wrong"}
            </p>
          </div>
        </div>
      )}

      {!isLoading && !isError && profile && (
        <SecuritySettings profile={profile} />
      )}
    </AccountLayout>
  );
};