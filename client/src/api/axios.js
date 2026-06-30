/**
 * src/api/axios.js
 *
 * PURPOSE:
 *   Single shared Axios instance for all HTTP communication with the
 *   NexCart backend. Every service file in src/services/ imports `api`
 *   from here — never from the "axios" package directly.
 *
 * BACKEND CONNECTION:
 *   Base URL points to the NexCart backend (Express + MongoDB).
 *   The backend uses HttpOnly cookies for JWT storage, so this instance
 *   is configured with `withCredentials: true` to send those cookies on
 *   every request automatically.
 *
 * SECURITY:
 *   - No tokens are ever stored in this file, localStorage, or sessionStorage.
 *   - `withCredentials: true` is required for the backend's CORS config
 *     (which whitelists the frontend origin with `credentials: true`) to work.
 *   - The response interceptor (src/api/interceptors.js) handles automatic
 *     token refresh on 401 — this file stays focused on instance creation.
 *
 * SCALABILITY:
 *   - Every future service (product.service.js, cart.service.js, etc.)
 *     reuses this single instance, so base URL and credential behavior
 *     never need to be reconfigured per-module.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",

  // CRITICAL: sends HttpOnly cookies (accessToken, refreshToken) automatically
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

export default api;