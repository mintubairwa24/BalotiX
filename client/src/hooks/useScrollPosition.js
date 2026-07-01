/**
 * src/hooks/useScrollPosition.js
 *
 * PURPOSE:
 *   Tracks window scroll Y position. Used by the Header to add a
 *   shadow/border when the user has scrolled past the hero area,
 *   making the sticky header visually separate from page content.
 *
 * REUSE:
 *   Any component that needs scroll-aware behaviour (e.g. a
 *   "scroll to top" button visibility, parallax effects) imports this.
 */

import { useState, useEffect } from "react";

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setIsScrolled(y > 10);
    };

    // Passive: true → browser can optimise scroll performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return { scrollY, isScrolled };
}