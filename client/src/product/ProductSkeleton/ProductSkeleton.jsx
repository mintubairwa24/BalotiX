/**
 * src/components/product/ProductSkeleton/ProductSkeleton.jsx
 *
 * PURPOSE:
 *   Shimmer placeholder card matching ProductCard's exact dimensions.
 *   Prevents layout shift during data fetch — the grid holds its shape
 *   while products load.
 *
 * WHY SEPARATE FROM ProductCardSkeleton.jsx:
 *   The existing ProductCardSkeleton.jsx in components/product/ is a
 *   flat file from Phase 3 scaffolding. This new component lives inside
 *   the correct sub-folder architecture required by Phase 5 and adds
 *   a variant prop for the ProductDetailsPage skeleton layout.
 *
 * REUSE:
 *   - ProductGrid uses it when isLoading=true
 *   - ProductListingPage uses it during initial fetch
 *   - RelatedProducts section uses it while loading related items
 *
 * VARIANTS:
 *   "card"   → standard grid card skeleton (default)
 *   "detail" → full-width product detail page skeleton
 */

import { Skeleton } from "../../components/ui/Skeleton/Skeleton";

function CardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      <Skeleton className="h-52 w-full rounded-none" />
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

function DetailSkeleton() {
  return (
    <div
      className="grid lg:grid-cols-2 gap-8 lg:gap-12"
      aria-hidden="true"
      role="presentation"
    >
      {/* Gallery col */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>

      {/* Info col */}
      <div className="space-y-5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-sm" />
          ))}
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-px w-full" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductSkeleton({ variant = "card", count = 1 }) {
  if (variant === "detail") return <DetailSkeleton />;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  );
}