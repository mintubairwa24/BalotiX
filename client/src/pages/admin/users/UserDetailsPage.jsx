/**
 * FILE: src/pages/admin/users/UserDetailsPage.jsx
 *
 * ============================================================================
 * UserDetailsPage — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/users/:id route. A thin shell (Convention #3) that does the
 * role-gate check, then renders <UserDetails userId={id} /> — UserDetails
 * itself owns the actual data-fetching and composition (see that file's
 * header). This mirrors how AdminDashboardPage stayed thin and delegated
 * to DashboardOverview in Phase 17.
 *
 * PRODUCTION-READY BECAUSE:
 * - Breadcrumb-style back link keeps the admin oriented within the Users
 *   section
 * - An "Edit" link to EditUserPage sits alongside the back link, giving a
 *   second, obvious entry point into editing beyond UserDetails' own
 *   action buttons (which cover status/role/delete, not the name/phone
 *   edit form)
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Pencil } from "lucide-react";
import { useAuthStore } from "../../../store";
import  UserDetails  from "../../../components/admin/users/UserDetails/UserDetails";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      setBlocked(true);
      const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user, isAdmin, navigate]);

  if (isAuthLoading) return null;
  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting…
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <Link
          to={`/admin/users/${id}/edit`}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <Pencil className="h-4 w-4" /> Edit
        </Link>
      </div>

      <UserDetails userId={id} />
    </div>
  );
};

export default UserDetailsPage;