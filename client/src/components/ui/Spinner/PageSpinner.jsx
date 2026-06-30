/**
 * src/components/ui/Spinner/PageSpinner.jsx
 *
 * PURPOSE:
 *   Full-page loading indicator shown by route guards
 *   (ProtectedRoute, GuestRoute, AdminRoute) while the initial
 *   /auth/me request is in flight on app mount.
 *
 * REUSE:
 *   Also usable for any future page-level loading state (lazy-loaded
 *   route transitions, large data fetches before render).
 */

import { motion } from "framer-motion";

export function PageSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-xl font-bold text-gray-900">NexCart</span>
        </div>

        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>
    </div>
  );
}