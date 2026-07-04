/**
 * src/hooks/useIntersectionObserver.js
 *
 * PURPOSE:
 *   Returns a [ref, isInView] pair. Attach `ref` to any element and
 *   `isInView` becomes true once that element scrolls into the viewport.
 *
 * USAGE WITH FRAMER MOTION:
 *   const [ref, isInView] = useIntersectionObserver();
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0, y: 32 }}
 *     animate={isInView ? { opacity: 1, y: 0 } : {}}
 *   />
 *
 * WHY NOT framer-motion's useInView:
 *   This hook is a plain Intersection Observer — zero extra bundle weight,
 *   and it works with any element (motion or not). The `once` option
 *   (default true) means the animation only runs the first time the
 *   section enters view, matching the expected "reveal" UX.
 *
 * REUSE:
 *   Every homepage section uses this. Future pages (Product Detail,
 *   Category page) will use it for lazy-render optimizations.
 */

import { useRef, useState, useEffect } from "react";

export function useIntersectionObserver(options = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  const { threshold = 0.1, rootMargin = "0px 0px -60px 0px", once = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip in environments without IntersectionObserver (e.g. old browsers)
    if (!window.IntersectionObserver) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, rootMargin, once]);

  return [ref, isInView];
}