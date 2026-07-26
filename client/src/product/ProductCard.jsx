/**
 * src/components/product/ProductCard.jsx
 *
 * PURPOSE:
 *   The single reusable product display card used across:
 *   - HomePpage: Featured, New Arrivals, Best Sellers, Trending sections
 *   - ProductListingPage (Phase 5)
 *   - CategoryPage (Phase 5)
 *   - SearchPage (Phase 5)
 *   - WishlistPage (Phase 6)
 *
 * PROPS:
 *   product → product object matching backend shape (see home.constants.js)
 *   variant → "default" | "compact"
 *             "default"  = standard card with image, name, price, rating
 *             "compact"  = smaller card for tight grids
 *
 * WHY THIS ARCHITECTURE IS SCALABLE:
 *   All product actions (Add to Cart, Add to Wishlist) are rendered here
 *   as UI stubs. When Phase 5 wires the Cart and Wishlist APIs:
 *   1. Import the mutations from cart.service.js / wishlist.service.js
 *   2. Replace the placeholder onClick handlers
 *   3. Zero visual changes needed — the card already has the right slots
 *
 * PRICE DISPLAY:
 *   Always uses `effectivePrice` (backend virtual), never raw `price`.
 *   formatPrice() formats paise → ₹ with Indian number system.
 *
 * FUTURE CONNECTIONS:
 *   - onClick on card → navigate to /products/:slug
 *   - Cart button   → POST /cart/items { productId, quantity: 1 }
 *   - Heart button  → POST /wishlist/items { productId }
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, Zap } from "lucide-react";
import { buildPath, ROUTES } from "../../constants/route.constants";

// Formats paise → ₹ with Indian number system
// e.g. 119900 → "₹1,19,900"
const formatPrice = (paise) =>
  `₹${paise.toLocaleString("en-IN")}`;

export function ProductCard({ product, variant = "default" }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) return null;

  const {
    name, slug, brand, effectivePrice, price,
    isOnSale, discountPercentage, averageRating,
    totalReviews, isInStock, isLowStock,
  } = product;

  const productPath = buildPath(ROUTES.PRODUCT_DETAIL, { slug });

  // Stub handlers — replaced with real mutations in Phase 5
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  const isCompact = variant === "compact";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/8 dark:hover:shadow-black/30 transition-shadow duration-300"
    >
      <Link to={productPath} className="block" tabIndex={-1} aria-hidden="true">
        {/* ── Product Image ──────────────────────────────────────── */}
        <div
          className={`relative ${isCompact ? "h-40" : "h-52"} bg-gray-50 dark:bg-gray-800 overflow-hidden`}
        >
          {/* Image placeholder — replaced by <img src={thumbnail}> in Phase 5 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
              <ShoppingCart
                size={28}
                className="text-indigo-400 dark:text-indigo-500"
              />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOnSale && discountPercentage > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                <Zap size={9} />
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

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={[
              "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              isWishlisted
                ? "bg-rose-500 text-white opacity-100"
                : "bg-white dark:bg-gray-800 text-gray-400 hover:text-rose-500 shadow-sm",
            ].join(" ")}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        </div>
      </Link>

      {/* ── Product Info ───────────────────────────────────────────── */}
      <div className={`${isCompact ? "p-3" : "p-4"}`}>
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

        {/* Rating */}
        {!isCompact && (
          <div className="flex items-center gap-1.5 mt-2">
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
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({totalReviews.toLocaleString("en-IN")})
            </span>
          </div>
        )}

        {/* Price row */}
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

          {/* Add to cart button */}
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
            <ShoppingCart size={13} />
            <span className="hidden sm:inline">
              {!isInStock ? "Sold Out" : addedToCart ? "Added!" : "Add"}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}