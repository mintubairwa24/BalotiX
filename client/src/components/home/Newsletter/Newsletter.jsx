/**
 * src/components/home/Newsletter/Newsletter.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Final conversion section on the home page. It captures email interest
 *   without introducing backend dependency in Phase 4.
 *
 * WHY IT IS_REUSABLE:
 *   The layout can be reused for sale alerts, restock notifications, or
 *   future lifecycle email capture experiences.
 *
 * FUTURE PHASE CONNECTION:
 *   A future marketing or auth phase can connect this form to a real
 *   subscription endpoint without changing the visual structure.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   This file keeps the interaction model minimal and accessible: a single
 *   email field, one clear CTA, and no unnecessary local state.
 */

import { motion } from "framer-motion";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";

import { useIntersectionObserver } from "../../../hooks/useIntersectionObserver";

export function Newsletter() {
  const [ref, isInView] = useIntersectionObserver();

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="bg-white py-14 dark:bg-gray-950 sm:py-20" aria-label="Newsletter signup">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 px-6 py-10 shadow-xl sm:px-10 sm:py-12 dark:border-slate-800"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.95fr] lg:items-center">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-indigo-100 backdrop-blur-sm">
                <Mail size={12} aria-hidden="true" />
                Newsletter
              </span>

              <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Stay ahead of new drops, exclusive deals, and member-only offers.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Join the NexCart email list for launch alerts, product highlights,
                and the occasional surprise discount.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" />
                  No spam
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" />
                  Unsubscribe anytime
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-5">
              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="newsletter-email" className="block text-sm font-medium text-white">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:bg-white/15"
                />

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-slate-900 transition-colors hover:bg-indigo-50"
                >
                  Subscribe Now
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </form>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
                By subscribing, you agree to receive updates from NexCart. See our{" "}
                <span className="underline decoration-white/30 underline-offset-2">
                  privacy policy
                </span>{" "}
                for details.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
