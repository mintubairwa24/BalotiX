/**
 * src/components/category/CategorySkeleton/CategorySkeleton.jsx
 *
 * PURPOSE:
 *   Shimmer loading placeholders matching exact dimensions of:
 *   - CategoryGrid card (variant="card")
 *   - CategorySidebar row (variant="sidebar")
 *   - CategoryHeader (variant="header")
 *
 *   Prevents layout shift — the page holds its shape while data loads.
 *
 * WHY SEPARATE FROM ProductSkeleton:
 *   Category cards have different proportions (icon-based, shorter, wider)
 *   than product cards (image-heavy, taller). A shared skeleton would not
 *   match the actual card dimensions, causing visible layout shift on load.
 *
 * REUSE:
 *   CategoryGrid.jsx  → variant="card"   (grid of category cards loading)
 *   CategorySidebar   → variant="sidebar" (sidebar rows loading)
 *   CategoryPage      → variant="header"  (page header loading)
 *
 * PROPS:
 *   variant → "card" | "sidebar" | "header"
 *   count   → number of skeleton items to render
 */

import { Skeleton } from "../../ui/Skeleton/Skeleton";

function CardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center gap-3"
      aria-hidden="true"
      role="presentation"
    >
      {/* Icon circle */}
      <Skeleton className="w-14 h-14 rounded-2xl" />
      {/* Name */}
      <Skeleton className="h-4 w-20" />
      {/* Count */}
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5"
      aria-hidden="true"
      role="presentation"
    >
      <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-14" />
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div
      className="space-y-4 py-8"
      aria-hidden="true"
      role="presentation"
    >
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-4 w-3/4 max-w-lg" />
    </div>
  );
}

export function CategorySkeleton({ variant = "card", count = 1 }) {
  if (variant === "header") return <HeaderSkeleton />;

  const SkeletonComponent = variant === "sidebar" ? SidebarSkeleton : CardSkeleton;

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
}