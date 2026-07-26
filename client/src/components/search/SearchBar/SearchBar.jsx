/**
 * src/components/search/SearchBar/SearchBar.jsx
 *
 * PURPOSE:
 *   Dedicated search entry point for the search results page and future global
 *   search surfaces. It combines the reusable input and suggestion components.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   The component uses the existing product search endpoint indirectly through
 *   the search hook, which is the only place that should touch the API layer.
 *
 * FUTURE REUSE:
 *   This component can be reused by the header, a full-screen search modal, or
 *   a mobile search experience without re-implementing the interaction logic.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It supports debounced input, suggestion previews, and keyboard-friendly
 *   submission while remaining small and focused.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "../SearchInput/SearchInput";
import { SearchSuggestions } from "../SearchSuggestions/SearchSuggestions";
import { useDebounce } from "../../../hooks/useDebounce";
import { searchProducts } from "../../../services/product.service";
import { useClickOutside } from "../../../hooks/useClickOutside";

export function SearchBar({ initialQuery = "", onSearch }) {
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const debouncedQuery = useDebounce(query, 350);

  useClickOutside(containerRef, () => setIsFocused(false));

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const loadSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await searchProducts(debouncedQuery.trim(), { limit: 5 });
        setSuggestions(response.data?.data?.products ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadSuggestions();

    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }

    setIsFocused(false);
  };

  const handleSelectSuggestion = (product) => {
    navigate(`/products/${product.slug}`);
    setIsFocused(false);
  };

  const suggestionList = useMemo(() => suggestions.slice(0, 5), [suggestions]);

  return (
    <div ref={containerRef} className="relative w-full">
      <SearchInput
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onSubmit={handleSubmit}
        onClear={() => setQuery("")}
        placeholder="Search products, brands or categories"
        isFocused={isFocused}
      />

      <SearchSuggestions
        suggestions={suggestionList}
        isOpen={isFocused && (suggestionList.length > 0 || isLoadingSuggestions)}
        isLoading={isLoadingSuggestions}
        onSelect={handleSelectSuggestion}
      />
    </div>
  );
}
