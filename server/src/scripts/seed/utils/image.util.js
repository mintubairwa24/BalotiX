/**
 * @file image.util.js
 * @location src/scripts/seed/utils/image.util.js
 *
 * WHY THIS FILE WAS UPDATED:
 * The original version used only Picsum, which returns SEEDED RANDOM
 * photos with no relationship to the product name — this is why seeded
 * products showed unrelated images. This version tries Pexels FIRST
 * (real keyword search, e.g. "smartphone" returns an actual smartphone),
 * and only falls back to Picsum if PEXELS_API_KEY is missing or a
 * specific search returns no results — so seeding never hard-fails on
 * image generation either way.
 *
 * WHY THIS IS NOW ASYNC:
 * Pexels requires a network call. buildProductImages() is now async, and
 * its one call site in product.seeder.js awaits it. This was documented
 * as the intended upgrade path in the original README.
 *
 * HOW THE SEARCH QUERY IS CHOSEN:
 * Uses template.tags[0] — in products.data.js, the first tag was
 * deliberately authored as the most GENERIC product-type word (e.g.
 * "smartphone", "sneakers", "yoga-mat") rather than a brand name, which
 * gives Pexels' search the best chance of returning a visually accurate
 * result. Falls back to the product name if no tags exist.
 *
 * HOW IT INTEGRATES:
 * - product.seeder.js calls `await buildProductImages(template)` per product
 * - updateProductImages.js (companion script) calls the same function to
 *   fix images on ALREADY-SEEDED products without a full reseed
 * - category.seeder.js still calls buildCategoryImage() (unchanged, Picsum —
 *   category banners are abstract backgrounds, not literal product photos,
 *   so keyword accuracy matters far less there)
 */

import { slugify } from "./slugify.util.js";
import { searchPexelsPhotos, getNextPexelsPhoto } from "./pexels.util.js";
import SEED_CONFIG from "../seed.config.js";

const { width: PW, height: PH } = SEED_CONFIG.PRODUCT_IMAGE_SIZE;
const { width: CW, height: CH } = SEED_CONFIG.CATEGORY_IMAGE_SIZE;

function buildPicsumUrl(seed, width, height) {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * buildPicsumFallbackImages
 * The original deterministic-but-unrelated image generator, used only as
 * a fallback when Pexels is unavailable or a search comes up empty.
 *
 * @param {string} productName
 * @returns {Array<{url: string, altText: string, isPrimary: boolean}>}
 */
function buildPicsumFallbackImages(productName) {
  const baseSeed = slugify(productName);

  const primary = {
    url: buildPicsumUrl(baseSeed, PW, PH),
    altText: productName,
    isPrimary: true,
  };

  const gallery = Array.from(
    { length: SEED_CONFIG.GALLERY_IMAGES_PER_PRODUCT },
    (_, i) => ({
      url: buildPicsumUrl(`${baseSeed}-${i + 1}`, PW, PH),
      altText: `${productName} — view ${i + 2}`,
      isPrimary: false,
    })
  );

  return [primary, ...gallery];
}

/**
 * buildProductImages
 * Returns an array matching Product.images schema shape exactly:
 *   [{ url, altText, isPrimary }]
 *
 * Tries Pexels keyword search first (relevant, real product-type photos).
 * Falls back to Picsum (unrelated but deterministic) only if Pexels is
 * unavailable or returns zero results for this product's search term.
 *
 * @param {{name: string, tags?: string[]}} template - product name + tags
 * @returns {Promise<Array<{url: string, altText: string, isPrimary: boolean}>>}
 */
export async function buildProductImages(template) {
  const { name, tags = [] } = template;
  const searchQuery = tags[0] || name;

  const neededCount = 1 + SEED_CONFIG.GALLERY_IMAGES_PER_PRODUCT;
  await searchPexelsPhotos(searchQuery, Math.max(neededCount, 6));

  const photoUrls = Array.from({ length: neededCount }, () =>
    getNextPexelsPhoto(searchQuery)
  ).filter(Boolean);

  // Fallback: Pexels unavailable or search returned nothing for this term
  if (photoUrls.length === 0) {
    return buildPicsumFallbackImages(name);
  }

  return photoUrls.map((url, i) => ({
    url,
    altText: i === 0 ? name : `${name} — view ${i + 1}`,
    isPrimary: i === 0,
  }));
}

/**
 * buildCategoryImage
 * Returns a single URL string matching Category.image schema field.
 * Still uses Picsum — category banners are abstract/decorative background
 * images, so literal keyword accuracy matters far less than for products.
 *
 * @param {string} categoryName
 * @returns {string}
 */
export function buildCategoryImage(categoryName) {
  return buildPicsumUrl(slugify(categoryName), CW, CH);
}

export default { buildProductImages, buildCategoryImage };