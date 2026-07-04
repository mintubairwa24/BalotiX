/**
 * src/components/common/SearchBar/SearchBar.jsx
 *
 * PURPOSE:
 *   UI-only search input component for the Header. Structured to accept
 *   future API integration with zero refactoring.
 *
 * CURRENT STATE (Phase 3):
 *   - Renders a search input with icon, clear button, keyboard shortcut hint
 *   - Manages local `query` state
 *   - Calls onSearch(query) prop — which today is a no-op navigate to /search
 *
 * FUTURE STATE (Product Search Phase):
 *   1. Import useDebounce from hooks/useDebounce.js (already built)
 *   2. Add a useQuery call with key ["search", debouncedQuery]
 *   3. Render results dropdown below the input
 *   4. The component's JSX, styling, and prop interface stay identical
 *
 * USAGE:
 *   <SearchBar placeholder="Search products..." />
 */

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useClickOutside } from "../../../hooks/useClickOutside";

export function SearchBar({ placeholder = "Search for products, brands...", className = "" }) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useClickOutside(containerRef, () => setIsFocused(false));

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // Future: this triggers the search results page
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsFocused(false);
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} role="search">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search
            size={16}
            className={`transition-colors ${
              isFocused ? "text-indigo-200" : "theme-text-muted"
            }`}
            aria-hidden="true"
          />
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          aria-label="Search NexCart"
          className={[
            "w-full rounded-xl border theme-surface-muted theme-text",
            "pl-10 pr-10 py-2.5 text-sm placeholder:text-gray-400",
            "transition-all duration-200",
            "focus:outline-none focus:bg-[var(--app-surface-strong)]",
            isFocused
              ? "border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-700"
              : "theme-border hover:border-[var(--app-border-strong)]",
          ].join(" ")}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 theme-text-muted hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/*
        FUTURE SEARCH RESULTS DROPDOWN:
        When the search API is integrated, render results here:

        {isFocused && debouncedQuery && (
          <SearchResultsDropdown
            query={debouncedQuery}
            onSelect={() => setIsFocused(false)}
          />
        )}
      */}
    </div>
  );
}
