/**
 * src/components/home/Testimonials/TestimonialCard.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Atomic testimonial card for the home page's social proof section.
 *   It keeps the repeatable review layout separate from the grid wrapper.
 *
 * WHY IT IS REUSABLE:
 *   The same review card pattern can power future review carousels or
 *   product-page social proof blocks.
 *
 * FUTURE PHASE CONNECTION:
 *   Future review or ratings phases can supply live testimonial records
 *   to the same component with no JSX changes.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The star row is rendered from data rather than hardcoded icons so the
 *   card remains durable when the rating scale changes later.
 */

import { Star, BadgeCheck } from "lucide-react";

export function TestimonialCard({ testimonial }) {
  const { name, location, avatar, avatarGradient, rating, review, product, verified } = testimonial;

  return (
    <article className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-gray-900">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarGradient} text-sm font-bold text-white shadow-md`}
          aria-hidden="true"
        >
          {avatar}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {name}
            </h3>
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                <BadgeCheck size={10} aria-hidden="true" />
                Verified
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            {location}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}
            aria-hidden="true"
          />
        ))}
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {review}
      </p>

      <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
        Purchased: <span className="font-semibold text-slate-600 dark:text-slate-300">{product}</span>
      </div>
    </article>
  );
}
