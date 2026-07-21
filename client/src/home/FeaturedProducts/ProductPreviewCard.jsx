/**
 * src/components/home/FeaturedProducts/ProductPreviewCard.jsx
 *
 * WHY THIS FILE EXISTS:
 *   A homepage-scoped product preview card. Unlike the full ProductCard
 *   (src/components/product/ProductCard.jsx) which will handle cart and
 *   wishlist mutations, this component is intentionally read-only:
 *   it displays product data and links to the product detail page.
 *
 * WHY "PREVIEW" NOT "PRODUCT CARD":
 *   The ProductCard in components/product/ is the authoritative card used
 *   across ProductListingPage, SearchPage, WishlistPage, and CategoryPage.
 *   The PreviewCard is a homepage-specific lightweight variant — it has
 *   stub action handlers that will remain stubs until Phase 5 wires the
 *   Cart and Wishlist APIs. Keeping them separate prevents premature coupling.
 *
 * WHY IT IS REUSABLE:
 *   - FeaturedProducts.jsx (today)
 *   - HomePage future sections can import this same card
 *   The `variant` prop slot is prepared: "default" (4-col) or "compact" (smaller)
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 (Product & Cart Module):
 *   - Replace handleAddToCart stub with:
 *     const { mutate } = useMutation({ mutationFn: (id) => cartService.addItem(id, 1) })
 *   - Replace handleWishlist stub with:
 *     const { mutate } = useMutation({ mutationFn: (id) => wishlistService.addItem(id) })
 *   Zero visual changes to the JSX. Only the onClick handlers change.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Uses effectivePrice (backend virtual field) — NEVER raw price.
 *   Prices are in paise (₹119900 = ₹1,19,900). formatPrice() converts.
 *   See PROJECT_CONTEXT.md Part 10, Rule 8.
 *
 * PROPS:
 *   product → { _id, name, slug, brand, effectivePrice, price, isOnSale,
 *               discountPercentage, averageRating, totalReviews,
 *               isInStock, isLowStock, thumbnail }
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Zap } from "lucide-react";
import { buildPath, ROUTES } from "../../../constants/route.constants";
import { WishlistButton } from "../../../components/wishlist/WishlistButton/WishlistButton";

// ── Utility: paise → ₹ with Indian number system ──────────────────────────────
// 119900 → "₹1,19,900"
// This function lives here intentionally — it is a display concern for this card.
// Phase 5 will move this to src/utils/formatCurrency.js and import from there.
const formatPrice = (paise) =>
  `₹${Number(paise).toLocaleString("en-IN")}`;

export function ProductPreviewCard({ product, variant = "default" }) {
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) return null;

  const {
    name, slug, brand,
    effectivePrice, price,
    isOnSale, discountPercentage,
    averageRating, totalReviews,
    isInStock, isLowStock,
  } = product;

  const productPath = buildPath(ROUTES.PRODUCT_DETAIL, { slug });
  const isCompact = variant === "compact";

  // ── Stub action handlers ───────────────────────────────────────────────────
  // Phase 5 replaces these with real React Query mutations.
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInStock) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };


  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/8 dark:hover:shadow-black/30 transition-shadow duration-300"
    >
      {/* ── Product image area ─────────────────────────────────────── */}
      <Link
        to={productPath}
        className="block"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className={`relative ${isCompact ? "h-40" : "h-52"} bg-gray-50 dark:bg-gray-800 overflow-hidden`}>

          {/*
            IMAGE PLACEHOLDER:
            Phase 5 replaces this with:
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
            when real thumbnail URLs come from the backend.
          */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
              <ShoppingCart size={28} className="text-indigo-400 dark:text-indigo-500" aria-hidden="true" />
            </div>
          </div>

          {/* ── Status badges ────────────────────────────────────── */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOnSale && discountPercentage > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                <Zap size={9} aria-hidden="true" />
                {discountPercentage}% OFF
              </span>
            )}
            {isLowStock && (
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                Low Stock
              </span>
            )}
            {!isInStock && (
              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* ── Wishlist button ──────────────────────────────────── */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WishlistButton
              productId={product._id}
              productName={product.name}
              size="sm"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>
      </Link>

      {/* ── Product info ──────────────────────────────────────────── */}
      <div className={isCompact ? "p-3" : "p-4"}>
        {/* Brand */}
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wide mb-1">
          {brand}
        </p>

        {/* Name */}
        <Link
          to={productPath}
          className="block text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-2 leading-snug"
        >
          {name}
        </Link>

        {/* Star rating */}
        {!isCompact && (
          <div className="flex items-center gap-1.5 mt-2" aria-label={`${averageRating} out of 5 stars`}>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={
                    i < Math.floor(averageRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-200 dark:text-gray-700"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({totalReviews.toLocaleString("en-IN")})
            </span>
          </div>
        )}

        {/* Price + Cart button */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {formatPrice(effectivePrice)}
            </span>
            {isOnSale && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          {/* Add to cart — stub, wired in Phase 5 */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={[
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200",
              !isInStock
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : addedToCart
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                  : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white",
            ].join(" ")}
            aria-label={addedToCart ? "Added to cart" : "Add to cart"}
          >
            <ShoppingCart size={13} aria-hidden="true" />
            <span className="hidden sm:inline">
              {!isInStock ? "Sold Out" : addedToCart ? "Added!" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}