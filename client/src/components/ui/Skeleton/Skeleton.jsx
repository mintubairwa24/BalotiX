/**
 * src/components/ui/Skeleton/Skeleton.jsx
 *
 * PURPOSE:
 *   Shimmer placeholder shown while data is loading. Used by
 *   ProductCard, OrderRow, and any async list to prevent layout shift
 *   and communicate loading state without a spinner.
 *
 * USAGE:
 *   <Skeleton className="h-4 w-32" />          → single line
 *   <Skeleton className="h-48 w-full rounded-xl" />  → card image
 */

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
      aria-hidden="true"
    />
  );
}