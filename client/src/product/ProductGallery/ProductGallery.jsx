/**
 * src/components/product/ProductGallery/ProductGallery.jsx
 *
 * PURPOSE:
 *   Image gallery for ProductDetailsPage. Displays the main image
 *   with a row of thumbnail selectors. Handles the case where the
 *   backend returns no images (shows a branded placeholder).
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   The backend Product object (GET /products/slug/:slug) returns:
 *   thumbnail: "https://..." — primary image URL
 *   images: [{ url, altText, isPrimary }] — full image array
 *
 *   Gallery uses `images` array for thumbnails. Falls back to `thumbnail`
 *   if `images` is empty. Falls back to a placeholder if both are null.
 *
 * WHY IT IS SEPARATE FROM ProductInfo:
 *   Gallery handles all image state (selectedIndex, zoom intent).
 *   ProductInfo handles all purchase state (quantity, cart, wishlist).
 *   Clean separation of concerns — future lightbox integration only
 *   touches this file.
 *
 * FUTURE ENHANCEMENT:
 *   Phase 8 — add a lightbox/zoom modal when the main image is clicked.
 *   This requires only adding a click handler and a Modal component here.
 *   ProductInfo and the page layout are completely unaffected.
 *
 * PROPS:
 *   images    → [{ url, altText, isPrimary }] from backend
 *   thumbnail → string | null — fallback primary image
 *   productName → string — used for alt text
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ZoomIn } from "lucide-react";

export function ProductGallery({ images = [], thumbnail = null, productName = "" }) {
  // Build the displayable image array from backend data
  const allImages = images.length
    ? images
    : thumbnail
    ? [{ url: thumbnail, altText: productName, isPrimary: true }]
    : [];

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = allImages[selectedIndex] ?? null;
  const hasImages = allImages.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Main image ─────────────────────────────────────────────── */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group">
        <AnimatePresence mode="wait">
          {hasImages && selectedImage ? (
            <motion.img
              key={selectedImage.url}
              src={selectedImage.url}
              alt={selectedImage.altText || productName}
              className="w-full h-full object-cover"
              loading="eager"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            /* Placeholder when no images available from backend */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900 flex items-center justify-center">
                <ShoppingBag size={40} className="text-indigo-400 dark:text-indigo-500" aria-hidden="true" />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                Image coming soon
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom hint */}
        {hasImages && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/40 text-white text-[10px] font-medium px-2 py-1 rounded-lg flex items-center gap-1">
              <ZoomIn size={11} aria-hidden="true" />
              <span>Click to zoom</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Thumbnails ─────────────────────────────────────────────── */}
      {allImages.length > 1 && (
        <div
          className="grid grid-cols-4 gap-3"
          role="tablist"
          aria-label="Product images"
        >
          {allImages.map((img, i) => (
            <button
              key={img.url || i}
              onClick={() => setSelectedIndex(i)}
              role="tab"
              aria-selected={selectedIndex === i}
              aria-label={img.altText || `Product image ${i + 1}`}
              className={[
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                selectedIndex === i
                  ? "border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/50"
                  : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
              ].join(" ")}
            >
              <img
                src={img.url}
                alt={img.altText || productName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}