/**
 * src/services/user.service.js  (EXTENDED — Phase 15)
 * 
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all User-profile backend interactions (distinct from
 * auth.service.js, which handles login/register/tokens/password —
 * this file handles the user's own profile DATA: name, email, phone,
 * avatar).
 * 
 * If a user.service.js already existed from Phase 1/2 (e.g. for
 * fetching the logged-in user on app load), this EXTENDS it with the
 * profile read/update/avatar functions this phase needs — merge these
 * exports into your existing file rather than creating a duplicate.
 * 
 * ASSUMPTIONS FLAGGED FOR BACKEND VERIFICATION:
 * - GET/PUT /users/profile for reading/updating the logged-in user's
 *   own profile. If your backend instead uses /users/me or exposes
 *   profile data via the auth "current user" endpoint, only
 *   getProfile()/updateProfile() need updating.
 * - POST /users/avatar (multipart/form-data) for avatar upload. This
 *   is explicitly OPTIONAL per this phase's instructions ("if backend
 *   supports it") — ProfileAvatar component only renders upload UI
 *   when this succeeds/exists; if your backend has no avatar endpoint,
 *   simply don't wire uploadAvatar() into ProfileAvatar (see that
 *   component's comments) and the rest of the phase is unaffected.
 * 
 * CRITICAL RULES:
 * - Service functions never touch React state, always return the full
 *   Axios response
 * - Frontend never validates business rules (e.g. email uniqueness) —
 *   backend is authoritative, frontend only does basic format validation
 */

import api  from "../api/axios";

const USER_ENDPOINTS = {
  GET_PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",
  UPLOAD_AVATAR: "/users/avatar",
};

const normalizeProfilePayload = (profileData = {}) => {
  const normalized = { ...profileData };

  if (normalized.name && !normalized.firstName && !normalized.lastName) {
    const parts = String(normalized.name).trim().split(/\s+/);
    normalized.firstName = parts.shift() || "";
    normalized.lastName = parts.join(" ");
  }

  return normalized;
};

/**
 * Fetch the logged-in user's profile
 * 
 * @returns {Promise} Axios response with profile data
 * 
 * RESPONSE SHAPE (assumed):
 * {
 *   success: true,
 *   data: {
 *     _id, name, email, phoneNumber, avatarUrl,
 *     createdAt, emailVerified
 *   }
 * }
 * 
 * WHEN TO CALL:
 * - AccountDashboardPage, ProfilePage, EditProfilePage on mount
 */
export const getProfile = () => {
  return api.get(USER_ENDPOINTS.GET_PROFILE);
};

/**
 * Update the logged-in user's profile
 * 
 * @param {Object} profileData - partial fields to update
 * { name, phoneNumber }
 * (email intentionally excluded — most backends treat email changes as
 * a separate, verification-gated flow; if yours allows it inline,
 * simply include `email` in the payload here)
 * 
 * @returns {Promise} Axios response with updated profile
 * 
 * ERRORS:
 * - 400: Validation failed
 * - 409: Conflict (e.g. phone number already in use), if applicable
 */
export const updateProfile = (profileData) => {
  return api.patch(USER_ENDPOINTS.UPDATE_PROFILE, normalizeProfilePayload(profileData));
};

/**
 * Upload/replace the user's avatar image
 * 
 * OPTIONAL — only call this if your backend implements it. See
 * ProfileAvatar component for how this is conditionally wired.
 * 
 * @param {File} file - image file from an <input type="file">
 * @returns {Promise} Axios response with the new avatar URL
 * 
 * RESPONSE SHAPE (assumed):
 * { success: true, data: { avatarUrl: string } }
 * 
 * IMPLEMENTATION NOTE:
 * Sent as multipart/form-data since it's a binary file upload — the
 * shared Axios instance's default JSON content-type is overridden here
 * only for this request via the FormData object (Axios auto-detects
 * FormData and sets the correct multipart boundary header).
 */
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return api.patch(USER_ENDPOINTS.UPLOAD_AVATAR, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};