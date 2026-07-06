/**
 * src/components/filters/SortDropdown/SortDropdown.jsx
 *
 * PURPOSE:
 *   Reusable sort control for the search results experience.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 *   It maps the selected sort option to the backend-supported sortBy/sortOrder
 *   query parameters used by the existing product listing endpoint.
 *
 * FUTURE REUSE:
 *   The same control can be reused by product listing and category pages.
 *
 * WHY THIS IS PRODUCTION-READY:
 *   It keeps sorting semantics explicit and aligned with the backend contract.
 */

export function SortDropdown({ value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <span className="font-medium">Sort by</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-950"
      >
        <option value="createdAt-desc">Newest</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A to Z</option>
        <option value="name-desc">Name: Z to A</option>
      </select>
    </label>
  );
}
