/**
 * src/components/home/SectionHeader.jsx
 *
 * PURPOSE:
 *   Reusable section header used by Featured Products, New Arrivals,
 *   Best Sellers, Trending, Categories, and Testimonials.
 *   Consistent heading hierarchy and "View All" link pattern across the page.
 *
 * PROPS:
 *   label      → small uppercase badge above the headline (e.g. "This Week")
 *   title      → main h2 headline
 *   subtitle   → optional supporting text
 *   viewAllTo  → path for the "View All →" link (omit to hide the link)
 *   viewAllLabel → override the link text (default: "View All")
 *   centered   → boolean, centers text (default false = left-aligned)
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function SectionHeader({
  label,
  title,
  subtitle,
  viewAllTo,
  viewAllLabel = "View All",
  centered = false,
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 ${centered ? "text-center sm:text-center" : ""}`}>
      <div className={centered ? "mx-auto max-w-2xl" : ""}>
        {label && (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2"
          >
            {label}
          </motion.span>
        )}

        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {viewAllTo && !centered && (
        <Link
          to={viewAllTo}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex-shrink-0 group"
        >
          {viewAllLabel}
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      )}
    </div>
  );
}