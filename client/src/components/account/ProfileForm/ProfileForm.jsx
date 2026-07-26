/**
 * src/components/account/ProfileForm/ProfileForm.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * The editable profile form, following the exact same pattern as
 * AddressForm (Phase 11): React Hook Form + Zod for client-side
 * validation, backend as final authority. Used exclusively by
 * EditProfilePage.
 * 
 * WHY EMAIL IS READ-ONLY HERE:
 * Per user.service.js's updateProfile() comments, email changes
 * typically require a separate verification-gated flow on most auth
 * backends (to prevent account takeover via unverified email swap).
 * This form shows the current email as a disabled field for context
 * but only submits name/phoneNumber. If your backend DOES support
 * inline email changes, enable the field and add it to the Zod schema
 * and submit payload — isolated to this one file.
 * 
 * Props:
 * - initialValues: profile object to prefill
 * - onSubmit: callback(data) — EditProfilePage wires this to useUpdateProfile
 * - isLoading: boolean
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is too short").max(50),
  lastName: z.string().max(50).optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .regex(/^[0-9\s\-+()]*$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
});

export const ProfileForm = ({ initialValues, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      firstName: initialValues?.firstName || initialValues?.name?.split?.(" ")[0] || "",
      lastName: initialValues?.lastName || initialValues?.name?.split?.(" ").slice(1).join(" ") || "",
      phoneNumber: initialValues?.phoneNumber || "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        firstName: initialValues.firstName || initialValues.name?.split?.(" ")[0] || "",
        lastName: initialValues.lastName || initialValues.name?.split?.(" ").slice(1).join(" ") || "",
        phoneNumber: initialValues.phoneNumber || "",
      });
    }
  }, [initialValues, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Email — read-only, see header comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          value={initialValues?.email || ""}
          disabled
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Contact support to change your email address
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name *
          </label>
          <input
            {...register("firstName")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.firstName && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name
          </label>
          <input
            {...register("lastName")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.lastName && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number
        </label>
        <input
          {...register("phoneNumber")}
          placeholder="+91 98765 43210"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.phoneNumber && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={18} className="animate-spin" />}
        Save Changes
      </button>
    </form>
  );
};