/**
 * src/components/home/Hero/Hero.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Section-level shell for the home page hero. It owns the responsive
 *   layout, background atmosphere, and the split between copy and visual
 *   storytelling.
 *
 * WHY IT IS REUSABLE:
 *   The hero is intentionally assembled from smaller pieces so future
 *   variants can swap HeroContent or HeroImage independently without
 *   changing the overall page composition.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 can inject live product imagery into HeroImage, while Phase 7
 *   can personalize HeroContent for authenticated shoppers.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Decorative layers are marked aria-hidden so they never pollute the
 *   accessibility tree. Layout concerns stay at the section boundary,
 *   which keeps the hero predictable and easy to test.
 */

import { HeroContent } from "./HeroContent";
import { HeroImage } from "./HeroImage";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-white dark:bg-gray-950 pt-10 pb-16 sm:pt-16 sm:pb-24"
      aria-label="Hero"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 opacity-60 blur-3xl dark:from-indigo-950 dark:to-violet-950" />
        <div className="absolute -bottom-24 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-tr from-cyan-100 to-blue-100 opacity-60 blur-3xl dark:from-cyan-950 dark:to-blue-950" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <HeroContent />
          <div className="hidden lg:block">
            <HeroImage />
          </div>
        </div>
      </div>
    </section>
  );
}
