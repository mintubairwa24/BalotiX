/**
 * src/components/common/ScrollToTop/ScrollToTop.jsx
 *
 * PURPOSE:
 *   Two responsibilities:
 *   1. Resets scroll to (0,0) on every route change — React Router doesn't
 *      do this automatically, so without it the user lands mid-page when
 *      navigating to a new route.
 *   2. Shows a floating "back to top" button once the user scrolls past
 *      400px, clicking which smoothly scrolls back to the top.
 *
 * PLACEMENT:
 *   Rendered once inside CustomerLayout, wrapping all pages.
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { useScrollPosition } from "../../../hooks/useScrollPosition";

export function ScrollToTop() {
  const { pathname } = useLocation();
  const { scrollY } = useScrollPosition();

  // Reset scroll on every navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  const showButton = scrollY > 400;

  return (
    <AnimatePresence>
      {showButton && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 flex items-center justify-center hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}