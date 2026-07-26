/**
 * src/components/ui/Input/PasswordField.jsx
 *
 * PURPOSE:
 *   Password input with a show/hide visibility toggle. Used on Login,
 *   Register, and Reset Password forms.
 *
 * USAGE with React Hook Form:
 *   <PasswordField label="Password" error={errors.password?.message} {...register("password")} />
 *
 * REUSE:
 *   Lives in components/ui/Input/ alongside FormField because it is a
 *   generic input primitive, not auth-specific business logic.
 *
 * ACCESSIBILITY:
 *   Toggle button is type="button" (won't submit the form), with an
 *   aria-label describing the current action.
 */

import { forwardRef, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const PasswordField = forwardRef(function PasswordField(
  { label, error, hint, id, className = "", ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const inputId = id || `password-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Lock size={16} className="text-gray-400" aria-hidden="true" />
        </div>

        <input
          ref={ref}
          id={inputId}
          type={visible ? "text" : "password"}
          autoComplete={props.autoComplete || "current-password"}
          className={[
            "w-full rounded-xl border bg-white px-4 py-3 pl-10 pr-11",
            "text-sm text-gray-900 placeholder-gray-400",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            error
              ? "border-red-400 bg-red-50 focus:ring-red-400"
              : "border-gray-200 hover:border-gray-300",
          ].join(" ")}
          aria-describedby={
            [error ? `${inputId}-error` : "", hint ? `${inputId}-hint` : ""]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={error ? "true" : undefined}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
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

export default PasswordField;