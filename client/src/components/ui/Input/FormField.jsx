/**
 * src/components/ui/Input/FormField.jsx
 *
 * PURPOSE:
 *   Standardized label + input + error pattern used across all forms.
 *   Accepts a forwarded ref for React Hook Form's register() compatibility.
 *
 * REUSE:
 *   Used in LoginForm (email), RegisterForm (name, email),
 *   ForgotPasswordForm (email). Future forms (profile edit, address,
 *   coupon input) reuse this from components/ui/Input/ — it is
 *   app-wide, not auth-specific.
 */

import { forwardRef } from "react";

const FormField = forwardRef(function FormField(
  { label, error, hint, id, icon: Icon, className = "", containerClassName = "", ...props },
  ref
) {
  const inputId = id || `field-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Icon size={16} className="text-gray-400" aria-hidden="true" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            Icon ? "pl-10" : "",
            error
              ? "border-red-400 bg-red-50 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300",
            className,
          ].join(" ")}
          aria-describedby={
            [error ? `${inputId}-error` : "", hint ? `${inputId}-hint` : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
      </div>

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-red-600">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;