/**
 * src/components/address/AddressForm/AddressForm.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Form component for creating new addresses or editing existing ones.
 * Uses React Hook Form + Zod validation for client-side validation.
 * Backend validates all data before persisting.
 * 
 * Modes:
 * - Create: New address form
 * - Edit: Prefilled with existing address data
 * 
 * Props:
 * - mode: "create" | "edit"
 * - initialValues: address object (for edit mode)
 * - onSubmit: callback after successful submit
 * - isLoading: boolean (show loading state)
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

// Zod validation schema for address
const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  fullName: z.string().min(2, "Name required").max(100),
  phoneNumber: z.string().regex(/^[0-9\s\-+()]*$/, "Invalid phone number"),
  addressLine1: z.string().min(5, "Address required").max(100),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City required").max(50),
  state: z.string().min(2, "State required").max(50),
  postalCode: z.string().regex(/^[0-9\-\s]*$/, "Invalid postal code"),
  country: z.string().min(2, "Country required").max(50),
  isDefault: z.boolean().optional(),
});

export const AddressForm = ({
  mode = "create",
  initialValues,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues: initialValues || {
      label: "",
      fullName: "",
      phoneNumber: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India", // Default to India
      isDefault: false,
    },
  });

  // Prefill form on edit mode
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset(initialValues);
    }
  }, [mode, initialValues, reset]);

  const handleFormSubmit = (data) => {
    onSubmit?.(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Row 1: Label + Default Checkbox */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address Label
          </label>
          <input
            {...register("label")}
            placeholder="e.g., Home, Office"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.label && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.label.message}
            </p>
          )}
        </div>

        {/* Set as Default Checkbox */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Default
            </span>
          </label>
        </div>
      </div>

      {/* Row 2: Full Name + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name *
          </label>
          <input
            {...register("fullName")}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.fullName && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number *
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
      </div>

      {/* Row 3: Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address Line 1 *
        </label>
        <input
          {...register("addressLine1")}
          placeholder="123 Main Street"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.addressLine1 && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {errors.addressLine1.message}
          </p>
        )}
      </div>

      {/* Row 4: Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Address Line 2 (Optional)
        </label>
        <input
          {...register("addressLine2")}
          placeholder="Apartment, suite, etc."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Row 5: City + State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City *
          </label>
          <input
            {...register("city")}
            placeholder="Mumbai"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.city && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.city.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State *
          </label>
          <input
            {...register("state")}
            placeholder="Maharashtra"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.state && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.state.message}
            </p>
          )}
        </div>
      </div>

      {/* Row 6: Postal Code + Country */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Postal Code *
          </label>
          <input
            {...register("postalCode")}
            placeholder="400001"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.postalCode && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.postalCode.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country *
          </label>
          <input
            {...register("country")}
            placeholder="India"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.country && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {errors.country.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isLoading && <Loader2 size={18} className="animate-spin" />}
        {mode === "create" ? "Add Address" : "Update Address"}
      </button>
    </form>
  );
};