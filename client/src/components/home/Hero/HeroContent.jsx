/**
 * src/components/home/Hero/HeroContent.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Holds the marketing copy, CTAs, and social proof stats for the hero.
 *   Separating it from the hero layout keeps messaging changes isolated.
 *
 * WHY IT IS REUSABLE:
 *   This component is self-contained and can later accept a variant prop
 *   for experiments, seasonal campaigns, or authenticated greetings.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 can point the CTA to live product discovery pages, while
 *   Phase 7 can render a welcome-back version for signed-in users.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   All motion is local to this file and the content comes from shared
 *   constants, which keeps presentation and data shape nicely separated.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Zap } from "lucide-react";

import { ROUTES } from "../../../constants/route.constants";
import { HERO_STATS } from "../../../constants/home.constants";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut", delay },
});

export function HeroContent() {
  return (
    <div className="text-center lg:text-left">
      <motion.div {...fadeUp(0)} className="inline-flex">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
          <Zap size={12} className="fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" aria-hidden="true" />
          India's Smartest Shopping Platform
        </span>
      </motion.div>

      <motion.h1
        {...fadeUp(0.1)}
        className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
      >
        Shop Smarter,{" "}
        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          Save More
        </span>
        <br />
        <span className="text-slate-700 dark:text-slate-300">Every Day.</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.2)}
        className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg lg:mx-0"
      >
        Discover 50,000+ premium products from top brands. Unbeatable prices,
        lightning-fast delivery, and a seamless shopping experience only on NexCart.
      </motion.p>

      <motion.div
        {...fadeUp(0.3)}
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
      >
        <Link
          to={ROUTES.PRODUCTS}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 dark:shadow-indigo-900/50 dark:hover:shadow-indigo-900/60 sm:w-auto group"
        >
          <ShoppingBag size={16} aria-hidden="true" />
          Shop Now
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>

        <Link
          to={`${ROUTES.PRODUCTS}?sale=true`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-400 sm:w-auto"
        >
          View Deals
        </Link>
      </motion.div>

      <motion.div
        {...fadeUp(0.4)}
        className="mt-10 flex items-center justify-center gap-6 sm:gap-8 lg:justify-start"
        aria-label="Platform statistics"
      >
        {HERO_STATS.map(({ value, label }) => (
          <div key={label} className="text-center lg:text-left">
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
