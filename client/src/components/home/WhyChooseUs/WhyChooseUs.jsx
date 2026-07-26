/**
 * src/components/home/WhyChooseUs/WhyChooseUs.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level trust builder for the home page. It converts static
 *   brand promises into a clear, scannable grid of benefits.
 *
 * WHY IT IS REUSABLE:
 *   The section accepts a features array, so another page can reuse the
 *   same trust layout with different content.
 *
 * FUTURE PHASE CONNECTION:
 *   This content is intentionally static because trust pillars are brand
 *   promises, but the section can still be reused in future landing pages.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Motion is applied to the grid container and individual cards, which
 *   produces a calm stagger without introducing extra rendering complexity.
 */

import { motion } from "framer-motion";

import { FeatureCard } from "./FeatureCard";
import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { WHY_CHOOSE_FEATURES } from "../../../constants/home.constants";

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
    <section className="bg-white py-14 dark:bg-gray-950 sm:py-20" aria-label="Why choose NexCart">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Our Promise
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Why Choose NexCart?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            We built NexCart around one goal: making online shopping in India genuinely better.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
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
