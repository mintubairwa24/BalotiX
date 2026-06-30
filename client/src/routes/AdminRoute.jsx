
//  * src/routes/AdminRoute.jsx
//  *
//  * PURPOSE:
//  *   Route guard requiring an authenticated session with role === "admin".
//  *   Used for all /admin/* routes.
//  *
//  * HOW IT CONNECTS TO THE BACKEND:
//  *   Reads isAuthenticated / user.role from auth.store.js. The admin
//  *   account is pre-seeded in the database (no public registration path),
//  *   so this guard simply checks the role on the already-verified session.
//  *
//  * REDIRECTS:
//  *   - Unauthenticated user        → /login
//  *   - Authenticated non-admin     → / (homepage)
//  *
//  * SECURITY CONSIDERATION:
//  *   Same as ProtectedRoute — this is a UX guard, not the security
//  *   boundary. Every admin API call is independently re-validated by
//  *   backend middleware (requireRole("admin")) regardless of what the
//  *   frontend allows the user to see.
//  *
//  * REUSE:
//  *   <Route element={<AdminRoute />}>
//  *     <Route path="/admin" element={<DashboardPage />} />
//  *     ...
//  *   </Route>
 

import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { PageSpinner } from "../components/ui/Spinner/PageSpinner";

export default function AdminRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}