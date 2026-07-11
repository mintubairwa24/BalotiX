/**
 * @file sku.util.js
 * @location src/scripts/seed/utils/sku.util.js
 *
 * WHY THIS FILE EXISTS:
 * Product.sku is a required, unique, uppercase field (confirmed in your
 * schema notes). Generating 70 SKUs by hand risks silent duplicates that
 * would throw a Mongoose E11000 error mid-seed. This utility derives a
 * readable SKU from brand + name, then guarantees uniqueness within the
 * current run via an in-memory Set.
 *
 * SKU FORMAT:
 *   {BRAND_PREFIX}-{NAME_CODE}-{COUNTER}
 *   e.g. "APPL-IPHONE15PRO-001"
 *
 * This is intentionally readable (unlike a random hash) so SKUs are
 * meaningful if you ever inspect the database directly — matching the
 * spirit of your doc's example: "APPL-IPH15PRO-256".
 *
 * HOW IT INTEGRATES:
 * Called once per product template inside product.seeder.js while building
 * the product documents array, BEFORE any DB writes happen.
 *
 * WHY PRODUCTION-READY:
 * Uniqueness is enforced in-process (fast, no DB round-trip needed during
 * generation) and the Set is scoped to a single seeder run via closure —
 * no global/module-level state leaks between repeated calls in a long-lived
 * process.
 */

import { slugify } from "./slugify.util.js";

/**
 * createSkuGenerator
 * Returns a stateful generator function scoped to one seeding run.
 * Call the returned function once per product to get a guaranteed-unique SKU.
 */
export function createSkuGenerator() {
  const usedSkus = new Set();

  /**
   * @param {string} brand
   * @param {string} name
   * @returns {string} A unique, uppercase SKU
   */
  return function generateSku(brand, name) {
    const brandPrefix = slugify(brand || "GEN")
      .replace(/-/g, "")
      .slice(0, 4)
      .toUpperCase()
      .padEnd(4, "X");

    const nameCode = slugify(name)
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase();

    let counter = 1;
    let candidate = `${brandPrefix}-${nameCode}-${String(counter).padStart(3, "0")}`;

    // Guard against collisions (e.g. two products with very similar names)
    while (usedSkus.has(candidate)) {
      counter += 1;
      candidate = `${brandPrefix}-${nameCode}-${String(counter).padStart(3, "0")}`;
    }

    usedSkus.add(candidate);
    return candidate;
  };
}

export default createSkuGenerator;