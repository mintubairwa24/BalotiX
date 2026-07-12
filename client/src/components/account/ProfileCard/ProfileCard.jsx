/**
 * src/components/account/ProfileCard/ProfileCard.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Read-only summary of the user's profile — avatar, name, email, phone,
 * member-since date. Used on both AccountOverview (dashboard) and
 * ProfilePage. Deliberately has NO edit affordances itself (no inline
 * editing) — editing is a distinct, dedicated flow on EditProfilePage,
 * keeping this component simple and purely presentational.
 * 
 * REUSE:
 * - ProfileAvatar (this phase, editable=false — display only here)
 * 
 * Props:
 * - profile: { name, email, phoneNumber, avatarUrl, createdAt, emailVerified }
 */

import { Mail, Phone, Calendar, BadgeCheck } from "lucide-react";
import { ProfileAvatar } from "../ProfileAvatar/ProfileAvatar";

export const ProfileCard = ({ profile }) => {
  if (!profile) return null;

  const displayName = profile.name || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User";
  const avatarUrl = profile.avatarUrl || profile.avatar || null;
  const emailVerified = profile.emailVerified ?? profile.isEmailVerified ?? false;

  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-4 mb-4">
        <ProfileAvatar
          name={displayName}
          avatarUrl={avatarUrl}
          size="lg"
        />
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {displayName}
            </h2>
            {emailVerified && (
              <BadgeCheck size={16} className="text-blue-500" title="Email verified" />
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Member since {formatDate(profile.createdAt)}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Mail size={16} className="text-gray-400" />
          {profile.email}
        </div>
        {profile.phoneNumber && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Phone size={16} className="text-gray-400" />
            {profile.phoneNumber}
          </div>
        )}
      </div>
    </div>
  );
};