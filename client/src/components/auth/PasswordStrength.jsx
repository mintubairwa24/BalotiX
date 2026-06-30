/**
 * src/components/auth/PasswordStrength.jsx
 *
 * PURPOSE:
 *   Real-time visual password strength meter shown while typing on
 *   RegisterForm and ResetPasswordForm.
 *
 * WHY components/auth/ AND NOT components/ui/:
 *   This component encodes auth-specific business rules (the exact
 *   password policy mirroring the backend's Joi constraints), not a
 *   generic, reusable UI primitive — so it lives alongside the auth
 *   forms that use it rather than in the generic ui/ folder.
 *
 * RULES (mirrors backend constraints):
 *   Weak    → < 8 chars
 *   Fair    → 8+ chars, missing one of uppercase/lowercase/number
 *   Good    → 8+ chars with uppercase + lowercase + number
 *   Strong  → Good + special char + 12+ chars
 *
 * USAGE:
 *   <PasswordStrength password={watch("password")} />
 */

import { motion } from "framer-motion";

const getStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { level: 2, label: "Fair", color: "bg-amber-500" };
  if (score <= 4) return { level: 3, label: "Good", color: "bg-blue-500" };
  return { level: 4, label: "Strong", color: "bg-emerald-500" };
};

export default function PasswordStrength({ password }) {
  const { level, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div
        className="flex gap-1"
        role="meter"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label={`Password strength: ${label}`}
      >
        {[1, 2, 3, 4].map((segment) => (
          <motion.div key={segment} className="h-1.5 flex-1 rounded-full overflow-hidden bg-gray-100">
            <motion.div
              className={`h-full rounded-full ${segment <= level ? color : "bg-transparent"}`}
              initial={{ width: 0 }}
              animate={{ width: segment <= level ? "100%" : "0%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {[
          { test: password.length >= 8, label: "8+ characters" },
          { test: /[A-Z]/.test(password), label: "Uppercase letter" },
          { test: /[a-z]/.test(password), label: "Lowercase letter" },
          { test: /[0-9]/.test(password), label: "Number" },
        ].map(({ test, label: reqLabel }) => (
          <div
            key={reqLabel}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              test ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${test ? "bg-emerald-500" : "bg-gray-300"}`} />
            {reqLabel}
          </div>
        ))}
      </div>
    </div>
  );
}