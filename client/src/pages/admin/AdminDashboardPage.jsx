/**
 * ============================================================================
 * src/pages/admin/AdminDashboardPage.jsx
 * AdminDashboardPage — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The route-level entry point for /admin. Its ONE job beyond rendering
 * DashboardOverview is the ROLE GATE — verifying the logged-in user is an
 * admin before showing anything admin-related. This keeps authorization
 * logic at the page boundary (Convention #3: pages are thin shells), not
 * scattered into AdminLayout or DashboardOverview.
 *
 * WHY THE GATE LIVES HERE, NOT IN A ROUTE GUARD COMPONENT:
 * This project already has route guards for auth (Phase 1 — e.g.
 * <ProtectedRoute>) that check "is the user logged in at all." Admin
 * access is a SECOND, STRICTER check ("is this logged-in user an admin"),
 * layered on top. Rather than building a whole new <AdminRoute> guard
 * component for a single route in this phase, the check lives directly in
 * this page — if Phase 18+ adds multiple /admin/* pages, THAT'S the
 * trigger to extract this into a reusable <AdminRoute> guard (wrapping
 * AdminLayout in AppRoutes.jsx), so the refactor happens when there's
 * actually more than one call site to justify it.
 *
 * BACKEND/AUTH CONTRACT (ASSUMED — FLAGGED, NOT VERIFIED):
 * useAuthStore() is assumed to expose `user` with a `role` field, e.g.
 * `user.role === "admin"`, based on the project's existing seed-script-only
 * admin creation pattern (PROJECT_CONTEXT.md — admins are created via a
 * terminal script, never a public API, implying the User model already
 * carries a role field distinguishing admin from customer). If the real
 * shape differs (e.g. `user.isAdmin` boolean, or roles as an array), only
 * the single `isAdmin` derivation below needs to change — nothing else in
 * this file, or any child component, depends on the exact shape.
 *
 * UX FOR NON-ADMINS:
 * Rather than a silent redirect (which can be confusing — "why did I just
 * end up on the homepage?"), a brief "Access Denied" message renders for a
 * beat before redirecting, so the user understands what happened. This
 * matches the project's general error-state philosophy (Convention #7 —
 * never fail silently).
 *
 * PRODUCTION-READY BECAUSE:
 * - Auth loading state is respected — if useAuthStore hasn't resolved yet
 *   (e.g. hydrating from a refresh-token flow), we show a neutral loading
 *   state rather than prematurely redirecting a legitimate admin
 * - No admin-only DATA is fetched until the role check passes — DashboardOverview
 *   (and its useDashboardStats/useRecentActivity calls) only mounts after
 *   the gate clears, so a non-admin never even triggers those network calls
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "../../store";
import { DashboardOverview } from "../../components/admin/DashboardOverview/DashboardOverview";
import { AdminSkeleton } from "../../components/admin/AdminSkeleton/AdminSkeleton";

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading); // flagged assumption: matches Phase 1/2's auth store shape

  // Derived, single point of change if the real role field differs (see file header).
  const isAdmin = user?.role === "admin";
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return; // wait for auth state to resolve before judging

    if (!user) {
      // Not logged in at all — send to login, same as any other protected route.
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdmin) {
      // Logged in, but not an admin — show a brief message, then redirect home.
      setShowAccessDenied(true);
      const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user, isAdmin, navigate]);

  if (isAuthLoading) {
    return (
      <div className="p-6">
        <AdminSkeleton variant="page" />
      </div>
    );
  }

  if (showAccessDenied) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="h-10 w-10 text-red-500" />
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Access Denied
        </h1>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
          This area is restricted to administrators. Redirecting you home…
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    // Brief window before the effect above kicks in — render nothing rather
    // than flashing admin content.
    return null;
  }

  return <DashboardOverview />;
};

export default AdminDashboardPage;