/**
 * src/components/ui/Loader/PageLoader.jsx
 *
 * PURPOSE:
 *   Full-viewport loading overlay used for:
 *   - Lazy-loaded route transitions
 *   - Page-level data fetching before first render
 *
 *   Distinct from PageSpinner (used by route guards during auth init) —
 *   PageLoader has the NexCart brand mark and is used inside the app
 *   shell after auth is confirmed.
 *
 * USAGE:
 *   if (isLoading) return <PageLoader />;
 */

import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-5"
      >
        {/* Pulsing brand mark */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900"
        >
          <span className="text-2xl font-bold text-white">N</span>
        </motion.div>

        {/* Three-dot bouncing loader */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-indigo-400"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}