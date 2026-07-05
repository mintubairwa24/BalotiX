/**
 * src/services/auth.service.js
 *
 * PURPOSE:
 *   Service layer for all authentication API calls. Every auth operation
 *   in the app (login, register, logout, etc.) funnels through this file.
 *
 * BACKEND CONNECTION:
 *   Consumes the NexCart auth module endpoints, defined in
 *   src/api/endpoints.js (AUTH_ENDPOINTS).
 *
 * SECURITY:
 *   - No tokens are stored or handled in this file.
 *   - The backend sets HttpOnly cookies on login/register; the browser
 *     manages them automatically via the `withCredentials: true` Axios
 *     instance (src/api/axios.js).
 *
 * REUSE:
 *   - src/store/auth.store.js actions are triggered by the calling
 *     component after these functions resolve.
 *   - src/hooks/useAuth.js calls getMe() on app mount.
 *   - Future modules (user.service.js for profile updates) follow this
 *     same 1-function-per-endpoint pattern.
 */

import api from "../api/axios";
import { AUTH_ENDPOINTS } from "../api/endpoints";

/**
 * Register a new customer account.
 * The backend forces role: "customer" regardless of what is sent.
 *
 * @param {{ name: string, email: string, password: string }} payload
 * @returns {Promise<AxiosResponse>}
 */
export const register = (payload) => api.post(AUTH_ENDPOINTS.REGISTER, payload);

/**
 * Login with email + password.
 * On success, backend sets HttpOnly accessToken + refreshToken cookies.
 *
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<AxiosResponse>}
 */
export const login = (payload) => api.post(AUTH_ENDPOINTS.LOGIN, payload);

/**
 * Logout the current user. Backend clears both HttpOnly cookies.
 *
 * @returns {Promise<AxiosResponse>}
 */
export const logout = () => api.post(AUTH_ENDPOINTS.LOGOUT);

/**
 * Verify the current session — the only way to check auth state on
 * the frontend since there is no token in localStorage to read.
 *
 * @returns {Promise<AxiosResponse>}
 */
export const getMe = () => api.get(AUTH_ENDPOINTS.STATUS);

/**
 * Manually trigger a token refresh.
 * Normally called automatically by the response interceptor on 401 —
 * rarely needs to be called directly from UI code.
 *
 * @returns {Promise<AxiosResponse>}
 */
export const refreshToken = () => api.post(AUTH_ENDPOINTS.REFRESH_TOKEN);

/**
 * Verify email using the token from the verification email link.
 *
 * @param {{ token: string }} payload
 * @returns {Promise<AxiosResponse>}
 */
export const verifyEmail = (payload) =>
  api.post(AUTH_ENDPOINTS.VERIFY_EMAIL, payload);

/**
 * Request a password reset email.
 * Backend returns 200 regardless of whether the email exists
 * (anti user-enumeration).
 *
 * @param {{ email: string }} payload
 * @returns {Promise<AxiosResponse>}
 */
export const forgotPassword = (payload) =>
  api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, payload);

/**
 * Reset password using the token from the reset email link.
 *
 * @param {{ token: string, password: string }} payload
 * @returns {Promise<AxiosResponse>}
 */
export const resetPassword = (payload) =>
  api.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload);