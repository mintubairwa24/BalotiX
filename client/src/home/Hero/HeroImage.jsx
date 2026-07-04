/**
 * src/components/home/Hero/HeroImage.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Isolates the visual/decorative right column of the hero section.
 *   All floating animation, mock product card, and badge graphics live
 *   here — completely independent of the text content in HeroContent.jsx.
 *
 * WHY IT IS REUSABLE:
 *   The outer Hero.jsx decides when and where to render this component.
 *   On mobile, Hero.jsx hides it entirely — this component never needs
 *   to know about responsive breakpoints; that concern belongs to the parent.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 (Product Module) — replace the static mock product card below
 *   with a real ProductCard fetched via GET /products/featured?limit=1.
 *   The replacement is a single JSX swap inside this file.
 *   Zero changes required in Hero.jsx or HeroContent.jsx.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Floating badges use Framer Motion's `animate` with repeat: Infinity
 *   for the bobbing effect. These are intentionally subtle (y: 0 → -8)
 *   to avoid motion sickness for users with vestibular disorders.
 *   Future: respect prefers-reduced-motion via a useReducedMotion hook.
 */

import { motion } from "framer-motion";
import { ShoppingBag, Star, Package } from "lucide-react";

export function HeroImage() {
  return (
    <div className="relative mx-auto max-w-sm" aria-hidden="true">

      {/* ── Main product showcase card ──────────────────────────────── */}
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-1 shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/60">
        <div className="rounded-[22px] bg-white dark:bg-gray-900 overflow-hidden">

          {/* Card image area — placeholder */}
          {/*
            FUTURE PHASE 5 REPLACEMENT:
            <img src={featuredProduct.thumbnail} alt={featuredProduct.name}
                 className="h-56 w-full object-cover" />
          */}
          <div className="h-56 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 flex items-center justify-center">
            <div className="relative">
              {/* Central icon placeholder */}
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 flex items-center justify-center shadow-xl">
                <ShoppingBag size={52} className="text-indigo-600 dark:text-indigo-400" />
              </div>

              {/* Floating discount badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-8 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg select-none"
              >
                40% OFF
              </motion.div>

              {/* Floating rating badge */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-2 -left-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 select-none"
              >
                <Star size={12} className="text-amber-400 fill-amber-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                  4.8 Rating
                </span>
              </motion.div>
            </div>
          </div>

          {/* Card product info — placeholder */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
              Apple
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
              iPhone 15 Pro
            </p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <span className="text-base font-black text-gray-900 dark:text-white">
                  ₹1,19,900
                </span>
                <span className="text-xs text-gray-400 line-through ml-2">
                  ₹1,34,900
                </span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Package size={14} className="text-white" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating order confirmation card ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute -left-12 bottom-12 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center gap-3 select-none"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
          <Package size={16} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900 dark:text-white">
            Order Delivered
          </p>
          <p className="text-[10px] text-gray-400">
            2 days delivery
          </p>
        </div>
      </motion.div>
    </div>
  );
}