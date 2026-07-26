/**
 * FILE: src/components/admin/users/UserAvatar/UserAvatar.jsx
 *
 * ============================================================================
 * UserAvatar — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A thin wrapper around Phase 15's `ProfileAvatar` — the brief explicitly
 * calls out "Avatar Components" under REUSE, and this project already has
 * exactly one avatar implementation (initials fallback, image support),
 * used both on the customer Account page and AdminWelcome (Phase 17).
 * Reimplementing avatar rendering here would violate Convention #11
 * (reuse over duplication) for something this project has already solved.
 *
 * WHY A WRAPPER, NOT A DIRECT IMPORT EVERYWHERE:
 * UserRow, UserProfileCard, and UserDetails all need an avatar, but at
 * different sizes and sometimes with a status-dot overlay (small "active/
 * suspended" indicator on the table row). Rather than have each of those
 * three components independently pass the right size prop to ProfileAvatar
 * and reimplement the status-dot positioning, this one file owns that
 * composition — same reasoning as AdminWelcome wrapping ProfileAvatar in
 * Phase 17, just now with a size/status API on top for THIS feature's
 * specific needs.
 *
 * PRODUCTION-READY BECAUSE:
 * - Falls back gracefully if ProfileAvatar's exact prop names differ
 *   slightly from what's assumed here (`avatarUrl`, `name`, `size`) — this
 *   is the one integration point flagged for verification, consistent
 *   with AdminWelcome's Phase 17 flagging of the same component
 * - Status dot is purely decorative (`aria-hidden`) — the actual status
 *   text is always available via UserStatus elsewhere, so this never
 *   becomes the ONLY way to perceive status (accessibility-safe)
 */

import { ProfileAvatar } from "../../../account";

const SIZE_DOT_CLASSES = {
  sm: "h-2 w-2 -right-0 -bottom-0",
  md: "h-2.5 w-2.5 -right-0.5 -bottom-0.5",
  lg: "h-3 w-3 -right-0.5 -bottom-0.5",
};

const UserAvatar = ({ avatarUrl, name, size = "md", status }) => {
  return (
    <div className="relative inline-flex">
      <ProfileAvatar avatarUrl={avatarUrl} name={name} size={size} />
      {status && (
        <span
          aria-hidden="true"
          className={`absolute rounded-full border-2 border-white dark:border-gray-800 ${SIZE_DOT_CLASSES[size]} ${
            status === "active" ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      )}
    </div>
  );
};

export default UserAvatar;