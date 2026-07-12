/**
 * src/components/account/AccountOverview/AccountOverview.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * The main content of AccountDashboardPage — a welcoming summary
 * combining the user's profile snapshot and quick stats/links into
 * other account-adjacent areas (Orders, Addresses, Wishlist, Security).
 * 
 * REUSE:
 * - ProfileCard (this phase)
 * - AccountStats (this phase)
 * 
 * Props:
 * - profile: profile object from useProfile()
 */

import { Link } from "react-router-dom";
import { Edit3, Lock, ArrowRight } from "lucide-react";
import { ProfileCard } from "../ProfileCard/ProfileCard";
import { AccountStats } from "../AccountStats/AccountStats";

export const AccountOverview = ({ profile }) => {
  return (
    <div className="space-y-4">
      <ProfileCard profile={profile} />

      <AccountStats />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/account/edit"
          className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <Edit3 size={16} />
            Edit Profile
          </span>
          <ArrowRight size={16} className="text-gray-400" />
        </Link>

        <Link
          to="/account/security"
          className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
            <Lock size={16} />
            Security Settings
          </span>
          <ArrowRight size={16} className="text-gray-400" />
        </Link>
      </div>
    </div>
  );
};