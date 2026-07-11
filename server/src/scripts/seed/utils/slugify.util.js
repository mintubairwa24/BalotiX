/**
 * @file slugify.util.js
 * @location src/scripts/seed/utils/slugify.util.js
 *
 * WHY THIS FILE EXISTS:
 * Your Product schema auto-generates its own `slug` field via a pre-save
 * hook — this utility does NOT touch that. This is a separate, seed-only
 * helper used purely to turn product/category names into deterministic
 * strings for Picsum image seeds and SKU generation.
 *
 * WHY DETERMINISTIC IMAGES MATTER:
 * Picsum returns the same image for the same seed string every time.
 * By deriving the seed from the product name (not a random number), running
 * `npm run seed` twice produces the exact same image set — which is what
 * "idempotent where practical" means for a visual-only concern like images.
 *
 * HOW IT INTEGRATES:
 * Used by image.util.js (picsum URLs) and sku.util.js (SKU codes).
 * Zero dependencies — no need to pull in `slugify` npm package for this.
 */

/**
 * slugify
 * Converts "Sony WH-1000XM5 Headphones" → "sony-wh-1000xm5-headphones"
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
}

export default slugify;