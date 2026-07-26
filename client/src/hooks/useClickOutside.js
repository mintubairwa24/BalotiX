/**
 * src/hooks/useClickOutside.js
 *
 * PURPOSE:
 *   Calls a handler when the user clicks outside a referenced element.
 *   Used by: SearchBar dropdown, UserMenu dropdown, MobileMenu overlay.
 *
 * USAGE:
 *   const ref = useRef(null);
 *   useClickOutside(ref, () => setOpen(false));
 *   <div ref={ref}>...</div>
 */

import { useEffect } from "react";

export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}