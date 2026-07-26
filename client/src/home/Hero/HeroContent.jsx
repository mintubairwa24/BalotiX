/**
 * src/components/home/Hero/HeroContent.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Separates the text/CTA logic from the visual illustration so that
 *   copy changes (headline, subtitle, CTAs) are isolated to this file.
 *   HeroImage.jsx and Hero.jsx remain untouched during marketing updates.
 *
 * WHY IT IS REUSABLE:
 *   Accepts no required props — it reads from home.constants.js and
 *   ROUTES. A future A/B test could pass a `variant` prop to swap
 *   headlines without rewiring any parent component.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 — the "Shop Now" CTA will link to the live ProductListingPage.
 *   Phase 7 — personalised headline when user is authenticated (e.g.
 *             "Welcome back, Ravi! Your wishlist has new deals").
 *             useAuthStore().user.name is already available in the store.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   All marketing copy lives in home.constants.js, not inline here.
 *   This means a non-technical team member can update content without
 *   reading React code.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Zap } from "lucide-react";
import { ROUTES } from "../../../constants/route.constants";
import { HERO_STATS } from "../../../constants/home.constants";

// ── Shared animation helper ────────────────────────────────────────────────────
// A factory returns the Framer Motion props for the staggered entrance.
// Delay is explicit so each element can enter at a different offset.
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

export function HeroContent() {
  return (
    <div className="text-center lg:text-left">

      {/* ── Badge ───────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="inline-flex">
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold px-4 py-1.5">
          <Zap
            size={12}
            className="fill-indigo-600 dark:fill-indigo-400 text-indigo-600 dark:text-indigo-400"
            aria-hidden="true"
          />
          India's Smartest Shopping Platform
        </span>
      </motion.div>

      {/* ── Headline ─────────────────────────────────────────────────── */}
      <motion.h1
        {...fadeUp(0.1)}
        className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[1.08] tracking-tight"
      >
        Shop Smarter,{" "}
        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Save More
        </span>
        <br />
        <span className="text-gray-700 dark:text-gray-300">Every Day.</span>
      </motion.h1>

      {/* ── Subtitle ─────────────────────────────────────────────────── */}
      <motion.p
        {...fadeUp(0.2)}
        className="mt-5 text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0"
      >
        Discover 50,000+ premium products from top brands.
        Unbeatable prices, lightning-fast delivery, and a seamless
        shopping experience — only on NexCart.
      </motion.p>

      {/* ── CTAs ─────────────────────────────────────────────────────── */}
      <motion.div
        {...fadeUp(0.3)}
        className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
      >
        {/* Primary CTA */}
        <Link
          to={ROUTES.PRODUCTS}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:shadow-xl hover:shadow-indigo-200 dark:hover:shadow-indigo-900/60 group"
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Shop Now
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>

        {/* Secondary CTA */}
        <Link
          to={`${ROUTES.PRODUCTS}?sale=true`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-sm transition-all duration-200"
        >
          View Deals
        </Link>
      </motion.div>

      {/* ── Trust stats ──────────────────────────────────────────────── */}
      {/*
        FUTURE PHASE CONNECTION:
        These stats are currently static (home.constants.js → HERO_STATS).
        Phase 5+ could fetch live counts from a public /stats endpoint.
      */}
      <motion.div
        {...fadeUp(0.4)}
        className="mt-10 flex items-center justify-center lg:justify-start gap-6 sm:gap-8"
        aria-label="Platform statistics"
      >
        {HERO_STATS.map(({ value, label }) => (
          <div key={label} className="text-center lg:text-left">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}