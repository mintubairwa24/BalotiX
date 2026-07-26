/**
 * src/pages/account/EditProfilePage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Profile editing page at route /account/edit. Hosts the editable
 * avatar (ProfileAvatar with editable=true, this phase) and the
 * ProfileForm (this phase), wiring form submission to
 * useUpdateProfile (this phase). On successful save, navigates back to
 * ProfilePage so the user immediately sees their updated read-only view.
 * 
 * BACKEND INTEGRATION:
 * - GET /users/profile (to prefill the form, via useProfile)
 * - PUT /users/profile (via useUpdateProfile, on submit)
 * - POST /users/avatar (via ProfileAvatar's internal useUploadAvatar,
 *   this phase — see ProfileAvatar's comments on this being optional)
 * 
 * REUSE:
 * - AccountLayout, ProfileForm, ProfileAvatar, AccountSkeleton (this phase)
 */

import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useProfile, useUpdateProfile } from "../../hooks/useAccount";
import {
  AccountLayout,
  ProfileForm,
  ProfileAvatar,
  AccountSkeleton,
} from "../../components/account";

export const EditProfilePage = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading, isError, error } = useProfile();

  const { mutate: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => navigate("/account/profile"),
  });

  return (
    <AccountLayout title="Edit Profile">
      {isLoading && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <AccountSkeleton variant="form" />
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
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-6">
          {/* Editable avatar — see ProfileAvatar.jsx for how upload is
              conditionally offered based on backend support */}
          <div className="flex justify-center">
            <ProfileAvatar
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              size="lg"
              editable
            />
          </div>

          <ProfileForm
            initialValues={profile}
            onSubmit={(data) => updateProfile(data)}
            isLoading={isPending}
          />
        </div>
      )}
    </AccountLayout>
  );
};