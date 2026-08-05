/**
 * src/components/home/WhyChooseUs/WhyChooseUs.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level component that addresses purchase hesitation — the most
 *   common drop-off point in e-commerce. Placed AFTER product sections
 *   (visitor is already interested) but BEFORE testimonials (objections
 *   first, then social proof from peers).
 *
 * WHY IT IS REUSABLE:
 *   Accepts an optional `features` prop. Defaults to WHY_CHOOSE_FEATURES
 *   from home.constants.js. A future "About Us" page can pass a different
 *   features array with the same card shape for a different context.
 *
 * FUTURE PHASE CONNECTION:
 *   This section is intentionally static — trust pillars are brand promises.
 *   No API phase will replace this data. It may receive a `columns` prop
 *   in Phase 8 to support a 3-col or 2-col variant for other pages.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Staggered animation via Framer Motion variants propagated from the
 *   container `motion.div`. Each FeatureCard receives the `itemVariants`
 *   automatically through the variants propagation system — FeatureCard
 *   does NOT need to import Framer Motion variants itself.
 *
 *   NOTE: FeatureCard uses whileHover independently — that coexists fine
 *   with parent-propagated variants.
 *
 * PROPS:
 *   features → array of feature objects (default: WHY_CHOOSE_FEATURES)
 */

import { motion } from "framer-motion";

import { FeatureCard } from "./FeatureCard";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { WHY_CHOOSE_FEATURES } from "../../../constants/home.constants";

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function WhyChooseUs({ features = WHY_CHOOSE_FEATURES }) {
  const [ref, isInView] = useIntersectionObserver();

  return (
    <section
      className="py-14 sm:py-20 bg-white dark:bg-gray-950"
      aria-label="Why choose BalotiX"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Centred section heading ───────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="block text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2">
            Our Promise
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Why Choose BalotiX?
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            We built BalotiX around one goal: making online shopping in India
            genuinely better.
          </p>
        </div>

        {/* ── Feature cards grid ───────────────────────────────── */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feature) => (
            <motion.div key={feature.id} variants={itemVariants}>
              <FeatureCard feature={feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}