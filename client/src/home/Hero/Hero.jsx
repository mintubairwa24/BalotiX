/**
 * src/components/home/Hero/Hero.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Orchestrates the two-column hero layout. This component owns:
 *   - The section's background decoration and spacing
 *   - The responsive grid (1 col on mobile, 2 cols on desktop)
 *   - The decision of when HeroImage is visible (hidden on mobile)
 *
 *   It delegates all text content to HeroContent.jsx and all visual
 *   illustration to HeroImage.jsx. Separation of concerns is complete.
 *
 * WHY IT IS REUSABLE:
 *   Future A/B test: pass a `variant` prop to swap HeroContent for
 *   an alternate copy variant without touching layout code.
 *
 *   Future personalisation: Hero.jsx can read from useAuthStore() to
 *   conditionally render a "Welcome back" hero vs the acquisition hero.
 *   HeroContent and HeroImage remain unchanged.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 — HeroImage will receive a real product as a prop fetched
 *   from GET /products/featured?limit=1.
 *   Phase 7 (Auth-aware) — conditionally render DashboardHero vs
 *   AcquisitionHero based on useAuthStore().isAuthenticated.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Background blobs use aria-hidden="true" — they are decorative and
 *   must not appear in the accessibility tree.
 *   The section uses aria-label="Hero" so screen readers announce the
 *   landmark correctly.
 */

import { HeroContent } from "./HeroContent";
import { HeroImage } from "./HeroImage";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-white dark:bg-gray-950 pt-10 pb-16 sm:pt-16 sm:pb-24"
      aria-label="Hero"
    >
      {/* ── Background decorations (purely visual) ──────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 opacity-60 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950 opacity-50 blur-3xl" />
      </div>

      {/* ── Content grid ─────────────────────────────────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left column — text and CTAs */}
          <HeroContent />

          {/* Right column — illustration (desktop only) */}
          <div className="hidden lg:block">
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
}