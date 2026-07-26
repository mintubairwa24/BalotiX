/**
 * src/components/home/FeaturedProducts/ProductPreviewSkeleton.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Shimmer placeholder that mirrors the ProductPreviewCard dimensions.
 *   It keeps the featured products section stable while content loads.
 *
 * WHY IT IS REUSABLE:
 *   Any future product-preview section can reuse this skeleton whenever
 *   it uses the same preview-card geometry.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 can toggle this on with an isLoading flag while data comes
 *   from React Query or a similar server-state layer.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   All skeleton content is marked presentational so it stays out of the
 *   accessibility tree and never competes with real content.
 */

import { Skeleton } from "../../../components/ui/Skeleton/Skeleton";

export function ProductPreviewSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-gray-900"
      aria-hidden="true"
      role="presentation"
    >
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-2.5 w-2.5 rounded-sm" />
          ))}
          <Skeleton className="ml-1 h-2.5 w-12" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
