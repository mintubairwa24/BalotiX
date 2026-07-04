/**
 * src/components/home/Testimonials/Testimonials.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level social proof block for the home page. It presents the
 *   testimonial cards in a clean, editorial grid.
 *
 * WHY IT IS REUSABLE:
 *   The section accepts a testimonials array, so future review sources or
 *   campaign variants can reuse the same layout contract.
 *
 * FUTURE PHASE CONNECTION:
 *   A future reviews module can feed real customer reviews into this
 *   component without redesigning the section.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Using a three-column grid on large screens keeps the cards readable
 *   and avoids the dense wall-of-text effect common in review sections.
 */

import { motion } from "framer-motion";

import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { TESTIMONIALS } from "../../../constants/home.constants";
import { TestimonialCard } from "./TestimonialCard";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function Testimonials({ testimonials = TESTIMONIALS }) {
  const [ref, isInView] = useIntersectionObserver();

  return (
    <section className="bg-gray-50 py-14 dark:bg-gray-900/50 sm:py-20" aria-label="Testimonials">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Social Proof
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Loved by Modern Shoppers
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Real customers. Real deliveries. Real reasons to trust the NexCart experience.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={itemVariants}>
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
