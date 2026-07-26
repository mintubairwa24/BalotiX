/**
 * src/components/home/FeaturedProducts/ProductPreviewCard.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Homepage-scoped product preview card. It is intentionally lighter
 *   than the future full product card and focuses on discovery.
 *
 * WHY IT IS REUSABLE:
 *   This card can be reused in any marketing section where we want to
 *   preview a product without exposing full commerce actions.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 can replace the static product array with live featured
 *   product data. The prop contract already mirrors the backend shape.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   The card is read-only and uses the full surface as a link target,
 *   which gives a large, accessible hit area on touch devices.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Zap } from "lucide-react";

import { buildPath, ROUTES } from "../../../constants/route.constants";
import { WishlistButton } from "../../wishlist/WishlistButton/WishlistButton";

const formatPrice = (paise) => `₹${Number(paise).toLocaleString("en-IN")}`;

export function ProductPreviewCard({ product, variant = "default" }) {
  if (!product) return null;

  const {
    name,
    slug,
    brand,
    effectivePrice,
    price,
    isOnSale,
    discountPercentage,
    averageRating,
    totalReviews,
    isInStock,
    isLowStock,
  } = product;

  const productPath = buildPath(ROUTES.PRODUCT_DETAIL, { slug });
  const isCompact = variant === "compact";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-black/5 dark:border-slate-800 dark:bg-gray-900 dark:hover:shadow-black/30"
    >
      <Link to={productPath} className="block" tabIndex={-1} aria-hidden="true">
        <div className={`relative ${isCompact ? "h-40" : "h-52"} overflow-hidden bg-slate-50 dark:bg-slate-800`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900">
              <ShoppingBag size={28} className="text-indigo-400 dark:text-indigo-500" aria-hidden="true" />
            </div>
          </div>

          <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WishlistButton
              productId={product._id}
              productName={product.name}
              size="sm"
              className="w-8 h-8 rounded-full"
            />
          </div>

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {isOnSale && discountPercentage > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                <Zap size={9} aria-hidden="true" />
                {discountPercentage}% OFF
              </span>
            )}
            {isLowStock && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                Low Stock
              </span>
            )}
            {!isInStock && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className={isCompact ? "p-3" : "p-4"}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          {brand}
        </p>

        <Link
          to={productPath}
          className="block text-sm font-semibold leading-snug text-slate-800 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 line-clamp-2"
        >
          {name}
        </Link>

        {!isCompact && (
          <div className="mt-2 flex items-center gap-1.5" aria-label={`${averageRating} out of 5 stars`}>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200 dark:text-slate-700"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ({totalReviews.toLocaleString("en-IN")})
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {formatPrice(effectivePrice)}
            </span>
            {isOnSale && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          <div
            className={[
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              isInStock
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600",
            ].join(" ")}
            aria-label={isInStock ? "Available for shopping" : "Currently out of stock"}
          >
            <ShoppingBag size={13} aria-hidden="true" />
            <span className="hidden sm:inline">{isInStock ? "Preview" : "Sold Out"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
