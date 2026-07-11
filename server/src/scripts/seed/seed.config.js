/**
 * @file seed.config.js
 * @location src/scripts/seed/seed.config.js
 *
 * WHY THIS FILE EXISTS:
 * Centralises every tunable constant used across the seed system so nothing
 * is hardcoded inside individual seeders. If you want to seed 200 products
 * instead of 70, or change stock ranges, this is the only file to touch.
 *
 * HOW IT INTEGRATES:
 * Imported by category.seeder.js, product.seeder.js, inventory.seeder.js,
 * and index.js. Does not import any Mongoose models — pure config, zero
 * side effects, safe to import anywhere without triggering a DB connection.
 *
 * FUTURE REUSE:
 * If you ever build an admin-panel "Generate Demo Catalog" button, the
 * Admin module's controller can import this same config file rather than
 * duplicating seed constants.
 *
 * WHY PRODUCTION-READY:
 * Every magic number in the seed system traces back to this single source
 * of truth. This is the same pattern your Product schema uses for
 * lowStockThreshold defaults — consistency with your existing conventions.
 */

export const SEED_CONFIG = {
  /** Role value used to look up the admin user for createdBy/updatedBy */
  ADMIN_ROLE: "admin",

  /** Product status seeded products should use — "active" makes them visible immediately */
  PRODUCT_STATUS: "active",

  /** Category status seeded categories should use */
  CATEGORY_STATUS: "active",

  /** Currency for all seeded pricing */
  CURRENCY: "INR",

  /** Inventory status default for seeded stock */
  INVENTORY_STATUS: "in_stock",

  /** Default thresholds applied when a product template doesn't override them */
  DEFAULT_LOW_STOCK_THRESHOLD: 10,
  DEFAULT_REORDER_POINT: 15,

  /** Stock quantity range for randomly generated warehouse stock (inclusive) */
  STOCK_RANGE: { min: 20, max: 300 },

  /** Review count range used by the ratings generator */
  REVIEW_COUNT_RANGE: { min: 15, max: 480 },

  /**
   * Image provider — "picsum" per confirmed architecture decision.
   * Kept as a config flag (not hardcoded in image.util.js) so swapping to
   * Cloudinary-hosted images later is a one-line change, not a rewrite.
   */
  IMAGE_PROVIDER: "picsum",

  /** Picsum image dimensions */
  PRODUCT_IMAGE_SIZE: { width: 800, height: 800 },
  CATEGORY_IMAGE_SIZE: { width: 1200, height: 400 },

  /**
   * How many gallery images to generate per product in addition to the
   * primary image. Each uses a distinct picsum seed (name + index) so
   * images differ but remain reproducible across reseeds.
   */
  GALLERY_IMAGES_PER_PRODUCT: 2,

  /**
   * If true, index.js will delete existing seeded Categories/Products/
   * Inventory before inserting new ones. Overridden by the --reset CLI flag.
   * Kept false by default so `npm run seed` is additive-safe unless you
   * explicitly ask for a reset.
   */
  CLEAR_BEFORE_SEED: false,
};

export default SEED_CONFIG;