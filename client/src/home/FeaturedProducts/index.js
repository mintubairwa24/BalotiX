/**
 * src/components/home/FeaturedProducts/index.js
 *
 * Public API for this feature folder.
 *
 * Exported (public):
 *   FeaturedProducts   → the section used by HomePage
 *   ProductPreviewCard → exported so other home sections can reuse it
 *                        (New Arrivals, Best Sellers, Trending use the same card)
 *   ProductPreviewSkeleton → exported so other sections can show matching skeletons
 *
 * NOT exported (internal):
 *   (nothing internal in this folder — all 3 are re-usable)
 */

export { FeaturedProducts } from "./FeaturedProducts";
export { ProductPreviewCard } from "./ProductPreviewCard";
export { ProductPreviewSkeleton } from "./ProductPreviewSkeleton";