/**
 * src/routes/ProtectedRoute.jsx
 *
 * PURPOSE:
 *   Route guard requiring any authenticated session (customer or admin).
 *   Used for /cart, /checkout, /account/*, /wishlist, etc.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Reads isAuthenticated / isLoading from auth.store.js, which is
 *   populated by useAuth() via GET /auth/me on app mount.
 *
 * SECURITY CONSIDERATION:
 *   This is a UX convenience, NOT a security boundary. A user who
 *   bypasses this and hits a protected API directly will still get a
 *   401 from the backend. The backend middleware is the real
 *   security layer — this guard only controls frontend navigation.
 *
 * LOADING STATE:
 *   While isLoading is true (initial session check in flight), renders
 *   a spinner instead of redirecting — prevents premature bounce to
 *   /login before the cookie session is confirmed.
 *
 * REUSE:
 *   Wrap any route needing auth in src/routes/AppRoutes.jsx:
 *     <Route element={<ProtectedRoute />}>
 *       <Route path="/cart" element={<CartPage />} />
 *     </Route>
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { PageSpinner } from "../components/ui/Spinner/PageSpinner";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageSpinner />;

  if (!isAuthenticated) {
    // Preserve intended destination so login can redirect back here
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}