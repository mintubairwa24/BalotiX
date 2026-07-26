/**
 * FILE: src/components/admin/categories/ParentCategorySelector/ParentCategorySelector.jsx
 *
 * ============================================================================
 * ParentCategorySelector — Phase 18D
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Phase 18B had two near-identical inline parent-category <select>
 * implementations — one inside CategoryForm (for assigning a parent on
 * create/edit), one inside CategoryFilters (for filtering the table by
 * parent). Phase 18D's brief explicitly lists this as its own component,
 * which is the right call: both use cases share the same data source
 * (useCategories()) and the same "exclude self when editing" concern, so
 * extracting them into one reusable selector removes duplicated dropdown
 * logic — this IS the "necessary refactor" the brief's exception clause
 * allows ("Do NOT refactor... unless absolutely necessary for Category
 * Management integration").
 *
 * TWO MODES VIA PROPS, NOT TWO COMPONENTS:
 * - Form mode (CategoryForm): `excludeId` set to the category being
 *   edited (so it can't be its own parent), `allowNone` labeled "None
 *   (top-level category)", value written straight into form state.
 * - Filter mode (CategoryFilters): `allowNone` labeled "Top-level only",
 *   no `excludeId` needed (filtering doesn't have a self-reference risk).
 * One component with a small, clear prop surface serves both — introducing
 * two files here would just be the same JSX with different label strings.
 *
 * REUSES: useCategories() (Phase 6) — same single categories data source
 * already used everywhere else in this project.
 *
 * PRODUCTION-READY BECAUSE:
 * - Disables gracefully while categories are loading
 * - `excludeId` filtering happens here once, instead of being
 *   reimplemented at each call site
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useCategories } from "../../../../hooks/useCategories";

export const ParentCategorySelector = ({
  value,
  onChange,
  excludeId,
  allowNoneLabel = "None (top-level category)",
  id = "parentCategory",
  className,
}) => {
  const { categories, isLoading } = useCategories();

  const options = (categories ?? []).filter((cat) => cat._id !== excludeId);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      aria-label="Parent category"
      className={
        className ??
        "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      }
    >
      <option value="">{allowNoneLabel}</option>
      {options.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
};

export default ParentCategorySelector;