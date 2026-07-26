/**
 * src/components/account/SecuritySettings/SecuritySettings.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Composes the Security page's content: account security info (email
 * verification status) + the collapsible ChangePasswordForm (this
 * phase). Kept as its own component (rather than inlined in
 * SecurityPage) so the page itself only handles routing/layout,
 * consistent with every other *Page/*Content split in NexCart.
 * 
 * REUSE:
 * - ChangePasswordForm (this phase)
 * - useChangePassword (this phase, useAccount.js)
 * - useAccountStore (this phase) for the collapse/expand toggle
 * 
 * Props:
 * - profile: { email, emailVerified }
 */

import { useState } from "react";
import { Lock, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "react-hot-toast";
import { ChangePasswordForm } from "../ChangePasswordForm/ChangePasswordForm";
import { useChangePassword, useResendVerification } from "../../../hooks/useAccount";
import { useAccountStore } from "../../../store/account.store";

export const SecuritySettings = ({ profile }) => {
  const [serverError, setServerError] = useState(null);
  const { isChangePasswordFormOpen, toggleChangePasswordForm, closeChangePasswordForm } =
    useAccountStore();
  const { mutate: resendVerification, isPending: isResending } = useResendVerification();

  const { mutate: changePassword, isPending } = useChangePassword({
    onError: (error) => {
      // Surface "wrong current password" inline, in addition to the toast
      if (error.response?.status === 400) {
        setServerError(error.response.data?.message || "Incorrect password");
      }
    },
  });

  const handleSubmit = (data, { onSuccess }) => {
    setServerError(null);
    changePassword(data, {
      onSuccess: () => {
        onSuccess?.();
        closeChangePasswordForm();
      },
    });
  };

  const handleResendVerification = () => {
    resendVerification({ email: profile.email }, {
      onSuccess: (data) => {
        toast.success(data?.data?.message || data?.message || "A new verification email has been sent.");
      }
    });
  };
  return (
    <div className="space-y-4">
      {/* Email verification status */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center gap-3">
        {profile?.emailVerified ? (
          <ShieldCheck size={20} className="text-green-600 dark:text-green-400 shrink-0" />
        ) : (
          <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {profile?.emailVerified ? "Email Verified" : "Email Not Verified"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {profile?.email}
          </p>
          {!profile?.emailVerified && (
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed dark:text-blue-400"
            >
              {isResending ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </div>
      </div>

      {/* Change password (collapsible) */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <button
          onClick={toggleChangePasswordForm}
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <Lock size={16} />
            Change Password
          </span>
          {isChangePasswordFormOpen ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>

        {isChangePasswordFormOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <ChangePasswordForm
              onSubmit={handleSubmit}
              isLoading={isPending}
              serverError={serverError}
            />
          </div>
        )}
      </div>
    </div>
  );
};