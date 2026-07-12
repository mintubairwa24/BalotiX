/**
 * src/hooks/useAccount.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Account-specific React Query hooks — the single place components
 * reach for profile/avatar/password operations. Composes
 * user.service.js (profile, avatar) and auth.service.js (password)
 * into one cohesive hook file since, from the UI's perspective, all of
 * these live under one "Account" feature even though they hit two
 * different backend modules.
 * 
 * Provides:
 * 1. useProfile() - fetch the logged-in user's profile
 * 2. useUpdateProfile(options) - update name/phone mutation
 * 3. useUploadAvatar(options) - avatar upload mutation (optional feature)
 * 4. useChangePassword(options) - password change mutation
 * 
 * CACHE STRATEGY:
 * - Profile is cached under ["profile"] and invalidated after both
 *   updateProfile AND uploadAvatar succeed, since both mutate the same
 *   underlying user document
 * - Password change does NOT invalidate the profile cache (password
 *   isn't part of the profile query's response shape) but DOES clear
 *   the form via the caller's onSuccess, handled in
 *   ChangePasswordForm/SecurityPage rather than here
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as userService from "../services/user.service";
import * as authService from "../services/auth.service";

const PROFILE_QUERY_KEY = ["profile"];

/**
 * Fetch the logged-in user's profile
 * 
 * @returns {Object} { data: profile, isLoading, isError, error }
 * 
 * USAGE:
 * const { data: profile, isLoading } = useProfile();
 * 
 * Used by AccountDashboardPage, ProfilePage, EditProfilePage (to
 * prefill the form), and ProfileCard/ProfileAvatar wherever rendered.
 */
export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await userService.getProfile();
      const profile = response.data?.data?.profile ?? response.data?.data ?? response.data;
      return profile;
    },
    staleTime: 1000 * 60, // profile changes infrequently — 1 min freshness is fine
    retry: 1,
  });
};

/**
 * Update the logged-in user's profile (name, phone, etc.)
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: updateProfile, isPending } = useUpdateProfile({
 *   onSuccess: () => navigate("/account/profile")
 * });
 * updateProfile({ name: "New Name", phoneNumber: "+91..." });
 */
export const useUpdateProfile = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData) => userService.updateProfile(profileData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Profile updated successfully");

      const profile = response.data?.data?.profile ?? response.data?.data ?? response.data;
      if (options.onSuccess) {
        options.onSuccess(profile);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Upload a new avatar image
 * 
 * OPTIONAL — see user.service.js's uploadAvatar() and
 * ProfileAvatar.jsx's comments on how this is conditionally surfaced
 * only when a backend avatar endpoint exists.
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: uploadAvatar, isPending } = useUploadAvatar();
 * uploadAvatar(file); // file: File object from <input type="file">
 */
export const useUploadAvatar = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file) => userService.uploadAvatar(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      toast.success("Profile picture updated");

      const profile = response.data?.data?.profile ?? response.data?.data ?? response.data;
      if (options.onSuccess) {
        options.onSuccess(profile);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to upload picture";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Change the logged-in user's password
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: changePassword, isPending } = useChangePassword({
 *   onSuccess: () => resetForm()
 * });
 * changePassword({ currentPassword, newPassword });
 * 
 * ERRORS:
 * - 400: Wrong current password or weak new password — backend
 *   message surfaced via toast, ALSO passed to onError so
 *   ChangePasswordForm can highlight the currentPassword field
 *   specifically rather than just showing a generic toast
 */
export const useChangePassword = (options = {}) => {
  return useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: (response) => {
      toast.success("Password changed successfully");

      if (options.onSuccess) {
        options.onSuccess(response.data?.data ?? response.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to change password";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};