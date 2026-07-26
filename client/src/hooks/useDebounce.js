/**
 * src/hooks/useDebounce.js
 *
 * PURPOSE:
 *   Returns a debounced version of a value. Used by SearchBar so that
 *   the search API is only called after the user stops typing (300ms),
 *   not on every keystroke.
 *
 * REUSE:
 *   SearchBar (Phase 3), ProductListingPage filter inputs (future).
 *
 * USAGE:
 *   const debouncedQuery = useDebounce(searchQuery, 300);
 *   useEffect(() => { if (debouncedQuery) fetchResults(debouncedQuery); }, [debouncedQuery]);
 */

import { useState, useEffect } from "react";

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}