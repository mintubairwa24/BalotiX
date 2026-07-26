import { useMemo } from "react";

import { useCategories } from "../../hooks/useCategories";
import { CategoryGrid } from "../../components/category/CategoryGrid/CategoryGrid";
import { CategoryEmpty } from "../../components/category/CategoryEmpty/CategoryEmpty";

export default function CategoriesPage1() {
  const {
    categories,
    rootCategories,
    flatCategories,
    isLoading,
    isError,
  } = useCategories();

  const landingCategories = useMemo(
    () => (rootCategories.length ? rootCategories : categories),
    [rootCategories, categories]
  );

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Browse Categories
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            All Categories
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Explore every category available in the store. Select a category to view subcategories and products.
          </p>
        </div>

        <CategoryGrid
          categories={landingCategories}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => window.location.reload()}
        />
      </div>
    </main>
  );
}
