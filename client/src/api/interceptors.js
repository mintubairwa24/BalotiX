/**
 * src/api/interceptors.js
 *
 * PURPOSE:
 *   Attaches request and response interceptors to the shared Axios
 *   instance. This file is imported ONCE in src/main.jsx (side-effect
 *   import) so the interceptors are registered before any component
 *   makes an API call.
 *
 * BACKEND CONNECTION:
 *   Implements the token refresh contract with the NexCart auth module:
 *     - Backend returns 401 with message "Session expired. Please log in
 *       again." when the accessToken cookie has expired but the
 *       refreshToken cookie is still valid.
 *     - POST /api/auth/refresh-token rotates both cookies server-side.
 *
 * HOW IT CONNECTS TO OTHER FILES:
 *   - Imports the `api` instance from src/api/axios.js
 *   - On terminal refresh failure, imports auth.store.js to clear the
 *     user and force a hard redirect to /login
 *
 * TOKEN REFRESH STRATEGY (race-condition safe):
 *   If multiple requests fail with 401 simultaneously, only ONE refresh
 *   call is made. The rest are queued and replayed once the refresh
 *   resolves. If the refresh fails, all queued requests are rejected
 *   and the user is redirected to /login.
 *
 * SCALABILITY:
 *   - New global request behavior (e.g., request IDs, CSRF tokens) is
 *     added to the request interceptor below.
 *   - New global error handling (e.g., logging to Sentry) is added to
 *     the response interceptor's final catch branch.
 */

import api from "./axios";
import { useAuthStore } from "../store/auth.store";

// ─── Request Interceptor ──────────────────────────────────────────────────

// No outgoing modifications needed today — cookies are sent automatically
// by the browser because of `withCredentials: true` in axios.js.
// This hook exists for future needs (e.g., attaching a CSRF token).
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Silent Token Refresh ──────────────────────────

let isRefreshing = false;
let failedRequestQueue = [];

const drainQueue = (error) => {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  failedRequestQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;

    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    const isAuthCheck = originalRequest?.url?.includes("/auth/me");
    const isAuthEndpoint = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email", "/auth/refresh-token"].some((path) => originalRequest?.url?.includes(path));

    // Only refresh on the specific "expired access token" signal —
    // not on every 401 (e.g., wrong password should NOT trigger a refresh)
    if (
      status === 401 &&
      message === "Session expired. Please log in again." &&
      !originalRequest._retry &&
      !isAuthCheck &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // A refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          failedRequestQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        drainQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        drainQueue(refreshError);

        if (isAuthenticated) {
          useAuthStore.getState().clearUser();
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);