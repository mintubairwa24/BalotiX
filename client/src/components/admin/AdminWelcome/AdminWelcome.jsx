/**
 * ============================================================================
 * src/components/admin/AdminWelcome/AdminWelcome.jsx
 * AdminWelcome — Phase 17
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A small greeting banner at the top of the dashboard overview — "Welcome
 * back, {name}" + avatar + current date. Purely presentational context,
 * no new data-fetching of its own.
 *
 * REUSES (Architectural Convention #11 — reuse over duplication):
 * - `useProfile()` (Phase 15) — the SAME hook AccountPage already uses to
 *   fetch the logged-in user's profile. An admin IS a user record with
 *   role: "admin", so there is no separate "admin profile" endpoint —
 *   reusing this hook avoids a duplicate fetch and a duplicate cache entry
 *   for data that already exists in the React Query cache from Phase 15.
 * - `ProfileAvatar` (Phase 15) — same avatar component (initials fallback,
 *   image support) used on the customer-facing Account page, so an admin's
 *   avatar renders identically everywhere in the app.
 *
 * WHY NOT A SEPARATE "AdminProfile" FETCH:
 * There is exactly one user/profile endpoint in this project
 * (/users/profile) — building a parallel "admin profile" hook would
 * duplicate a network call for data useProfile() already owns and caches.
 * This is the opposite of the OrderItems/CheckoutItems sibling pattern:
 * here reuse is correct because the underlying DATA SOURCE is identical,
 * not just visually similar.
 *
 * PRODUCTION-READY BECAUSE:
 * - Handles the loading state of useProfile() gracefully (skeleton-light
 *   placeholder text, not a blank flash)
 * - Dark mode via `dark:` classes (Convention #6)
 * - Falls back to "Admin" if the name isn't loaded yet, never renders
 *   "undefined"
 */

import { useProfile } from "../../../hooks/useAccount";
import { ProfileAvatar } from "../../account";

export const AdminWelcome = () => {
  const { profile, isLoading } = useProfile();

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <ProfileAvatar
        avatarUrl={profile?.avatarUrl}
        name={profile?.name}
        size="lg"
      />
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Welcome back{isLoading ? "" : `, ${profile?.name ?? "Admin"}`}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
      </div>
    </div>
  );
};

export default AdminWelcome;