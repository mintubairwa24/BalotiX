/**
 * src/components/account/ChangePasswordForm/ChangePasswordForm.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Form for changing the account password. Same React Hook Form + Zod
 * pattern as ProfileForm/AddressForm, with password-specific rules:
 * confirmation matching and a minimum strength check (client-side
 * convenience only — the backend re-validates and is authoritative on
 * actual password policy).
 * 
 * SECURITY:
 * - Fields are never pre-filled, never logged, and cleared from local
 *   form state immediately after a successful submit (via `reset()`)
 * - `currentPassword` field gets highlighted specifically on a 400
 *   error (see the `serverError` prop), since "wrong current password"
 *   is the most common failure and deserves inline feedback rather
 *   than just a toast
 * 
 * Props:
 * - onSubmit: callback({ currentPassword, newPassword })
 * - isLoading: boolean
 * - serverError: string|null — passed down from SecurityPage when the
 *   backend rejects the current password, to show inline under that field
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const ChangePasswordForm = ({
  onSubmit,
  isLoading = false,
  serverError = null,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const handleFormSubmit = (data) => {
    onSubmit(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset() }
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Current Password *
        </label>
        <input
          type="password"
          {...register("currentPassword")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {(errors.currentPassword || serverError) && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.currentPassword?.message || serverError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          New Password *
        </label>
        <input
          type="password"
          {...register("newPassword")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.newPassword && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Confirm New Password *
        </label>
        <input
          type="password"
          {...register("confirmPassword")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={18} className="animate-spin" />}
        Change Password
      </button>
    </form>
  );
};