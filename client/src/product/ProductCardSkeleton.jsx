/**
 * src/components/product/ProductCardSkeleton.jsx
 *
 * PURPOSE:
 *   Shimmer loading placeholder that exactly mirrors the dimensions
 *   of ProductCard. When Phase 5 fetches real products via React Query,
 *   render this while isLoading is true — zero layout shift.
 *
 * USAGE:
 *   {isLoading
 *     ? Array.from({ length: 8 }, (_, i) => <ProductCardSkeleton key={i} />)
 *     : products.map(p => <ProductCard key={p._id} product={p} />)
 *   }
 */

import { Skeleton } from "../ui/Skeleton/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Image area */}
      <Skeleton className="h-52 w-full rounded-none" />

      {/* Content area */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />

        <div className="flex items-center gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-2.5 rounded-sm" />
          ))}
          <Skeleton className="h-2.5 w-12 ml-1" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}