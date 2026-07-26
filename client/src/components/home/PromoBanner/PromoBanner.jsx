/**
 * src/components/home/PromoBanner/PromoBanner.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Full-width promotional banner used to break up the product sections
 *   and reinforce a high-conversion sale message.
 *
 * WHY IT IS REUSABLE:
 *   The component is driven by a single banner object, making it easy to
 *   swap campaigns later without rewriting any layout code.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 8 can replace the static banner with an admin-managed campaign
 *   payload while keeping the same UI contract.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Decorative background layers are aria-hidden and the banner keeps a
 *   single clear CTA hierarchy to avoid competing actions.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Zap } from "lucide-react";

import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { PROMO_BANNER } from "../../../constants/home.constants";

export function PromoBanner({ banner = PROMO_BANNER }) {
  const [ref, isInView] = useIntersectionObserver();

  return (
    <section className="bg-gray-50 py-6 dark:bg-gray-900/50 sm:py-10" aria-label="Promotional offer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 py-10 shadow-xl sm:px-12 sm:py-14"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="relative flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <Zap size={12} className="fill-white" aria-hidden="true" />
                {banner.badge}
              </div>

              <div className="flex flex-wrap items-baseline justify-center gap-3 lg:justify-start">
                <h2 className="text-4xl font-black text-white sm:text-5xl">
                  {banner.headline}
                </h2>
                <span className="text-xl font-bold text-indigo-200 sm:text-2xl">
                  {banner.subheadline}
                </span>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-indigo-100 sm:text-base">
                {banner.description}
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 lg:justify-start">
                <Clock size={14} className="text-indigo-300" aria-hidden="true" />
                <span className="text-xs font-medium text-indigo-200">
                  Sale ends Sunday midnight
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={banner.ctaPath}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-600 shadow-lg transition-colors hover:bg-indigo-50"
              >
                {banner.ctaLabel}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>

              <Link
                to={banner.secondaryCtaPath}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {banner.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
