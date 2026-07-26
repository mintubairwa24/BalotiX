/**
 * src/hooks/useAccount.js
 * 
 * ARCHITECTURAL PURPOSE:
 * PURPOSE:
 * Centralizes all React Query hooks related to user account management,
 * such as changing passwords and managing profile data. This keeps
 * component files clean and separates API logic from UI.
 *
 * TO-DO:
 * - Add useUpdateProfile hook for editing user details.
 * - Add useDeleteAccount hook for account deletion.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast"; // Corrected: Removed duplicate toast import
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
    ...options,
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
    mutationFn: authService.changePassword,
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

/**
 * Hook for resending the account verification email.
 */
export const useResendVerification = (options = {}) => {
  return useMutation({
    mutationFn: authService.resendVerificationEmail,
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send verification email.");
    },
    onSuccess: (data) => {
      // The component handles the toast on its own to show the server message.
    },
    ...options,
  });
};

/**
 * Hook for initiating an email change request.
 * @param {object} options - React Query mutation options
 */
export const useUpdateEmail = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authService.updateEmail(data),
    onSuccess: (response) => {
      toast.success(response.data?.message || "A verification link has been sent to your new email address.");
      // Optionally invalidate profile if the backend indicates an immediate change
      // queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      if (options.onSuccess) {
        options.onSuccess(response.data);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update email address.");
    },
    ...options,
  });
};