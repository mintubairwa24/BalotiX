/**
 * src/components/ui/Button/LoadingButton.jsx
 *
 * PURPOSE:
 *   Button with a built-in loading state — shows a spinner and disables
 *   itself during async operations. Prevents double-submit on every
 *   form across the app.
 *
 * USAGE:
 *   <LoadingButton isLoading={isPending} loadingText="Signing in..." fullWidth>
 *     Sign In
 *   </LoadingButton>
 *
 * REUSE:
 *   Used by every auth form today. Future modules (checkout, profile
 *   edit, admin product create) reuse this same component — it belongs
 *   in components/ui/Button/ precisely because it's app-wide, not
 *   auth-specific.
 *
 * ACCESSIBILITY:
 *   aria-busy + aria-disabled reflect loading state to screen readers.
 */

import { motion } from "framer-motion";

export default function LoadingButton({
  children,
  isLoading = false,
  loadingText = "Please wait...",
  fullWidth = false,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}) {
  const isDisabled = isLoading || disabled;

  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-300 disabled:bg-gray-50 disabled:text-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <motion.button
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={[
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}