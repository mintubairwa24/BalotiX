/**
 * src/components/home/FeaturedProducts/ProductPreviewSkeleton.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Shimmer placeholder that mirrors the exact dimensions and layout of
 *   ProductPreviewCard. When Phase 5 fetches real products via React Query,
 *   FeaturedProducts.jsx passes isLoading={true} which renders these
 *   skeletons instead of cards — zero layout shift for the user.
 *
 * WHY IT IS REUSABLE:
 *   Used by FeaturedProducts.jsx today.
 *   The same skeleton can be reused by any future product list section
 *   (New Arrivals, Best Sellers, Search Results) that uses the same
 *   card dimensions — just import from this file.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 — React Query's isLoading state will trigger this.
 *   Pattern in FeaturedProducts.jsx:
 *   {isLoading
 *     ? Array.from({ length: 4 }, (_, i) => <ProductPreviewSkeleton key={i} />)
 *     : products.map(p => <ProductPreviewCard key={p._id} product={p} />)
 *   }
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   aria-hidden="true" on all skeleton elements — they are presentational
 *   and must not confuse screen readers.
 *   animate-shimmer is defined in src/styles/animations.css.
 */

import { Skeleton } from "../../../components/ui/Skeleton/Skeleton";

export function ProductPreviewSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Image area */}
      <Skeleton className="h-52 w-full rounded-none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <Skeleton className="h-3 w-16" />

        {/* Product name */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />

        {/* Star rating row */}
        <div className="flex items-center gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-2.5 rounded-sm" />
          ))}
          <Skeleton className="h-2.5 w-12 ml-1" />
        </div>

        {/* Price + cart button row */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}