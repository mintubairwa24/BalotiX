/**
 * src/store/account.store.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Manages ACCOUNT UI STATE ONLY (not server data).
 * 
 * React Query owns the server state:
 *   - Profile data — useProfile (this phase)
 *   - Update/avatar/password mutations — useAccount.js (this phase)
 * 
 * Zustand owns:
 *   - isChangePasswordFormOpen — toggles the password form visibility
 *     on SecurityPage (collapsed by default, since most visits to
 *     Security won't be to change the password)
 *   - avatarPreviewUrl — a LOCAL, unpersisted object-URL preview of a
 *     newly selected avatar file, shown immediately in ProfileAvatar
 *     before the upload mutation resolves, for responsive UX
 * 
 * WHY avatarPreviewUrl LIVES HERE AND NOT IN COMPONENT STATE:
 * ProfileAvatar can be rendered in more than one place (ProfileCard on
 * the dashboard, EditProfilePage) — keeping the preview in a shared
 * store means selecting a new file in one place is reflected
 * immediately everywhere the avatar is shown, consistent with how
 * cart.store/coupon.store handle cross-component UI state in earlier
 * phases.
 * 
 * PERSISTENCE:
 * Does NOT persist to localStorage — avatarPreviewUrl is an
 * object-URL that's invalid after a page reload anyway, and password
 * form visibility resetting to closed on reload is the correct,
 * security-conscious default.
 */

import { create } from "zustand";

export const useAccountStore = create((set) => ({
  // Password form visibility on SecurityPage
  isChangePasswordFormOpen: false,

  // Local preview URL for a newly selected (not-yet-uploaded) avatar
  avatarPreviewUrl: null,

  /**
   * Toggle the change-password form open/closed
   */
  toggleChangePasswordForm: () =>
    set((state) => ({
      isChangePasswordFormOpen: !state.isChangePasswordFormOpen,
    })),

  /**
   * Close the change-password form (called after successful change)
   */
  closeChangePasswordForm: () =>
    set(() => ({
      isChangePasswordFormOpen: false,
    })),

  /**
   * Set a local preview URL for a newly selected avatar file
   * Called via URL.createObjectURL(file) in ProfileAvatar, BEFORE the
   * upload mutation completes
   * 
   * @param {string|null} url
   */
  setAvatarPreviewUrl: (url) =>
    set(() => ({
      avatarPreviewUrl: url,
    })),

  /**
   * Clear the local avatar preview
   * Called after upload succeeds (real avatarUrl now comes from the
   * refetched profile) or fails (revert to previous avatar)
   */
  clearAvatarPreviewUrl: () =>
    set(() => ({
      avatarPreviewUrl: null,
    })),
}));