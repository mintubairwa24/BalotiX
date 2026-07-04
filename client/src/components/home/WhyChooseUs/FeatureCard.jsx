/**
 * src/components/home/WhyChooseUs/FeatureCard.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Atomic trust-card used by the WhyChooseUs section. It isolates a
 *   single feature so the grid can stay declarative.
 *
 * WHY IT IS REUSABLE:
 *   The card shape works for trust benefits, service callouts, and other
 *   marketing surfaces that need a compact highlight pattern.
 *
 * FUTURE PHASE CONNECTION:
 *   This card is static and can be reused unchanged if another page wants
 *   the same trust-pillar presentation.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Visual metadata such as gradients and colors are carried by the data
 *   object, which keeps styling decisions outside the render tree.
 */

import { motion } from "framer-motion";

export function FeatureCard({ feature }) {
  const { icon: Icon, title, description, highlight, gradient, bgLight, iconColor } = feature;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative flex flex-col items-center rounded-2xl border border-slate-100 p-6 text-center transition-all duration-300 hover:shadow-md dark:border-slate-800 sm:p-7 ${bgLight}`}
    >
      <div
        className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}
        aria-hidden="true"
      >
        <Icon size={24} className="text-white" />
      </div>

      <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {description}
      </p>

      <span
        className={`rounded-full border border-slate-100 bg-white px-3 py-1 text-xs font-semibold dark:border-slate-800 dark:bg-gray-900 ${iconColor}`}
      >
        {highlight}
      </span>
    </motion.div>
  );
}
