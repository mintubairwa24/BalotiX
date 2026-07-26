/**
 * src/components/home/WhyChooseUs/FeatureCard.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Atomic card component for a single trust-pillar feature (Free Shipping,
 *   Secure Payments, Easy Returns, 24/7 Support). Separating it from
 *   WhyChooseUs.jsx follows the same single-responsibility principle
 *   as CategoryCard inside CategoryPreview.
 *
 * WHY IT IS REUSABLE:
 *   This card shape (gradient icon + title + description + highlight badge)
 *   is a general-purpose feature card pattern used across marketing sites.
 *   It can be reused in:
 *   - A future "About NexCart" page
 *   - A checkout trust-indicator bar
 *   - An "Our Services" landing section
 *   By keeping it in this folder (not hardcoded in WhyChooseUs), it is
 *   easily importable anywhere.
 *
 * FUTURE PHASE CONNECTION:
 *   This component is static — trust features are brand promises, not
 *   API data. No future phase will change this component's data source.
 *   It may receive a `layout` prop in future to support horizontal variants.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The icon gradient and background color come from the feature object
 *   defined in home.constants.js. This keeps ALL visual configuration in
 *   one place — a designer can change the color palette in constants
 *   without touching any component.
 *
 * PROPS:
 *   feature → { id, icon, title, description, highlight, gradient, bgLight, iconColor }
 *             Shape defined in WHY_CHOOSE_FEATURES in home.constants.js
 */

import { motion } from "framer-motion";

export function FeatureCard({ feature }) {
  const {
    icon: Icon,
    title,
    description,
    highlight,
    gradient,
    bgLight,
    iconColor,
  } = feature;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`
        relative flex flex-col items-center text-center
        p-6 sm:p-7 rounded-2xl
        border border-gray-100 dark:border-gray-800
        ${bgLight}
        transition-all duration-300 hover:shadow-md
      `}
    >
      {/* ── Icon ─────────────────────────────────────────────────── */}
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-5`}
        aria-hidden="true"
      >
        <Icon size={24} className="text-white" />
      </div>

      {/* ── Title ────────────────────────────────────────────────── */}
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* ── Description ──────────────────────────────────────────── */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
        {description}
      </p>

      {/* ── Highlight badge ──────────────────────────────────────── */}
      <span
        className={`text-xs font-semibold ${iconColor} bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800`}
      >
        {highlight}
      </span>
    </motion.div>
  );
}