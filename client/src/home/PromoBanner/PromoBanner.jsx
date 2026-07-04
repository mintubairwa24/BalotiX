/**
 * src/components/home/PromoBanner/PromoBanner.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Full-width promotional banner placed between Featured Products and
 *   New Arrivals to maximise sale conversion at the point where the
 *   visitor is already engaged with the product catalogue.
 *
 * WHY IT IS REUSABLE:
 *   All content is driven by PROMO_BANNER from home.constants.js.
 *   Changing the entire banner (headline, CTA text, CTA path) requires
 *   editing one object in the constants file — not touching this component.
 *
 *   Future: a `banner` prop allows this to render any admin-configured
 *   campaign banner:
 *     <PromoBanner banner={adminBanner} />
 *   The component JSX handles it without modification.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 8 (Admin Module) — an admin-configurable banner API:
 *   GET /banners?active=true → returns { headline, ctaLabel, ctaPath, ... }
 *   Pass the response as the `banner` prop. The component accepts it already.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The dot-pattern overlay uses an inline backgroundImage style —
 *   Tailwind can't generate arbitrary radial-gradient values, so an
 *   inline style is the correct approach here (not a Tailwind workaround).
 *   It is aria-hidden because it is purely decorative.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Clock } from "lucide-react";

import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";
import { PROMO_BANNER } from "../../../constants/home.constants";

export function PromoBanner({ banner = PROMO_BANNER }) {
  const [ref, isInView] = useIntersectionObserver();

  return (
    <section
      className="py-6 sm:py-10 bg-gray-50 dark:bg-gray-900/50"
      aria-label="Promotional offer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-6 sm:px-12 py-10 sm:py-14"
        >
          {/* ── Background decorations ────────────────────────────── */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
            {/* Dot pattern overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          {/* ── Content ───────────────────────────────────────────── */}
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">

            {/* Text column */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Zap size={12} className="fill-white" aria-hidden="true" />
                {banner.badge}
              </div>

              {/* Headline */}
              <div className="flex items-baseline gap-3 justify-center lg:justify-start flex-wrap">
                <h2 className="text-4xl sm:text-5xl font-black text-white">
                  {banner.headline}
                </h2>
                <span className="text-xl sm:text-2xl font-bold text-indigo-200">
                  {banner.subheadline}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-indigo-100 text-sm sm:text-base leading-relaxed max-w-xl">
                {banner.description}
              </p>

              {/* Expiry indicator */}
              <div className="mt-4 flex items-center gap-2 justify-center lg:justify-start">
                <Clock size={14} className="text-indigo-300" aria-hidden="true" />
                <span className="text-indigo-200 text-xs font-medium">
                  Sale ends Sunday midnight
                </span>
              </div>
            </div>

            {/* CTA column */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              {/* Primary CTA */}
              <Link
                to={banner.ctaPath}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg group"
              >
                {banner.ctaLabel}
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              {/* Secondary CTA */}
              <Link
                to={banner.secondaryCtaPath}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border-2 border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
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