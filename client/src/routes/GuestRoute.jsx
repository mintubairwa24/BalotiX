/**
 * src/routes/GuestRoute.jsx
 *
 * PURPOSE:
 *   Redirects already-authenticated users AWAY from guest-only pages
 *   (/login, /register, /forgot-password, /reset-password).
 *   Prevents a logged-in user from seeing the login form again.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Reads isAuthenticated / user.role from auth.store.js, populated by
 *   useAuth() via GET /auth/me on app mount.
 *
 * REDIRECT TARGET:
 *   - role === "admin" → /admin
 *   - otherwise        → / (homepage)
 *
 * REUSE:
 *   Wraps all 4 guest-only routes in src/routes/AppRoutes.jsx:
 *     <Route element={<GuestRoute />}>
 *       <Route path="/login" element={<LoginPage />} />
 *       ...
 *     </Route>
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { PageSpinner } from "../components/ui/Spinner/PageSpinner";

export default function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <PageSpinner />;

  if (isAuthenticated) {
    const destination = user?.role === "admin" ? "/admin" : "/";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}