/**
 * FILE: src/pages/admin/users/EditUserPage.jsx
 *
 * ============================================================================
 * EditUserPage — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/users/:id/edit route — lets an admin edit the narrow set of
 * fields user.service.js#updateUserByAdmin actually accepts (name, phone).
 *
 * WHY THE FORM IS INLINE HERE, NOT A SEPARATE COMPONENT FILE:
 * This phase's file list does not include a "UserForm" component — unlike
 * Products/Categories (which needed a substantial shared form reused
 * across BOTH create and edit), Users have no create flow at all (no
 * "Add User" — see UserEmpty's header) and no image/gallery/parent-select
 * complexity. A two-field form used on exactly one page doesn't earn its
 * own file per this project's "Do not create unnecessary files"
 * instruction — extracting it would be premature abstraction for a form
 * this small and this single-purpose.
 *
 * WHY ONLY name/phone ARE EDITABLE (not email or role):
 * Per user.service.js's header: email normally sits behind its own
 * verification flow, and role changes are a separate, higher-ceremony
 * action already covered by ChangeRoleModal (with its own confirmation
 * and admin-promotion warning) — mixing a role dropdown into this plain
 * text-field form would undercut that dedicated safeguard.
 *
 * BACKEND COMMUNICATION:
 * useAdminUserDetail(id) to pre-fill current values, then
 * useUpdateUserByAdmin() → PUT /users/:id on submit.
 *
 * PRODUCTION-READY BECAUSE:
 * - Submit disabled while pending; inline error surfaced verbatim from
 *   the backend on failure
 * - Form only renders once the real user data has loaded, so its
 *   useState initializer never sees undefined values
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store";
import { useAdminUserDetail } from "../../../hooks/useAdminUsers";
import { useUpdateUserByAdmin } from "../../../hooks/useAdminUsers";

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = authUser?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!authUser) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      setBlocked(true);
      const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, authUser, isAdmin, navigate]);

  const { user, isLoading, isError } = useAdminUserDetail(id);
  const { mutate: updateUser, isPending } = useUpdateUserByAdmin();

  const [fields, setFields] = useState({ name: "", phone: "" });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (user) setFields({ name: user.name ?? "", phone: user.phone ?? "" });
  }, [user]);

  if (isAuthLoading) return null;
  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting…
      </div>
    );
  }
  if (!isAdmin) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    updateUser(
      { id, data: fields },
      {
        onSuccess: () => navigate(`/admin/users/${id}`),
        onError: (err) =>
          setSubmitError(err?.response?.data?.message ?? "Something went wrong saving these changes."),
      }
    );
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
  const labelClasses = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="space-y-5">
      <div>
        <Link
          to={`/admin/users/${id}`}
          className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Profile
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Edit User</h1>
      </div>

      {isLoading && (
        <div className="max-w-md space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          Couldn't load this user. They may have been deleted.
        </div>
      )}

      {!isLoading && !isError && user && (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {submitError}
            </div>
          )}

          <div>
            <label className={labelClasses} htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={fields.name}
              onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses} htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={fields.phone}
              onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
              className={inputClasses}
            />
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Email and role aren't editable here — role changes go through
            "Change Role" on the profile page.
          </p>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/users/${id}`)}
              disabled={isPending}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditUserPage;