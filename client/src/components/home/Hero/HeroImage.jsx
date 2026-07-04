/**
 * src/components/home/Hero/HeroImage.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Renders the decorative product showcase for the hero's desktop view.
 *   It is separated from the text so the illustration can evolve on its
 *   own as product data becomes available later.
 *
 * WHY IT IS REUSABLE:
 *   The visual pattern here can be reused for future campaign heroes,
 *   seasonal landing pages, or personalized storefront variants.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 can replace the placeholder product card with a real featured
 *   product payload. The motion wrappers and layout can stay intact.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   This file is intentionally aria-hidden because every node is decorative.
 *   The layout uses stable spacing and small motion values for a premium,
 *   calm startup feel that avoids overpowering the rest of the page.
 */

import { motion } from "framer-motion";
import { Package, ShoppingBag, Star } from "lucide-react";

export function HeroImage() {
  return (
    <div className="relative mx-auto max-w-sm" aria-hidden="true">
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-1 shadow-2xl shadow-indigo-300 dark:shadow-indigo-900/60">
        <div className="overflow-hidden rounded-[22px] bg-white dark:bg-gray-900">
          <div className="flex h-56 items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-200 to-violet-200 shadow-xl dark:from-indigo-800 dark:to-violet-800">
                <ShoppingBag size={52} className="text-indigo-600 dark:text-indigo-400" />
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 -top-4 select-none rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg"
              >
                40% OFF
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-2 -left-10 flex select-none items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-2.5 py-1.5 shadow-lg dark:border-slate-700 dark:bg-gray-800"
              >
                <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  4.8 Rating
                </span>
              </motion.div>
            </div>
          </div>

          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
              Apple
            </p>
            <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
              iPhone 15 Pro
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  ₹1,19,900
                </span>
                <span className="ml-2 text-xs text-slate-400 line-through">
                  ₹1,34,900
                </span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600">
                <Package size={14} className="text-white" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute -left-12 bottom-12 flex select-none items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl dark:border-slate-800 dark:bg-gray-900"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
          <Package size={16} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900 dark:text-white">
            Order Delivered
          </p>
          <p className="text-[10px] text-slate-400">
            2 days delivery
          </p>
        </div>
      </motion.div>
    </div>
  );
}
