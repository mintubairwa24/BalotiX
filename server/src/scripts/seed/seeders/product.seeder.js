/**
 * @file product.seeder.js
 * @location src/scripts/seed/seeders/product.seeder.js
 *
 * WHY THIS FILE EXISTS:
 * This is the core of the seed system. It transforms the lightweight
 * templates in products.data.js into fully valid Product documents,
 * matching EVERY schema requirement confirmed in your architecture doc:
 * required fields (name, description, sku, price, categoryId, createdBy),
 * paise pricing, images shape, rating fields, and stock fields.
 *
 * WHY Product.create() AND NOT Product.insertMany():
 * This is the single most important architectural decision in this file.
 * insertMany() SKIPS Mongoose document middleware (pre('save') hooks).
 * Your schema relies on pre-save hooks for THREE things:
 *   1. slug generation from name
 *   2. thumbnail sync from the primary image
 *   3. isOnSale computation from price vs salePrice
 * If this seeder used insertMany() for speed, all three would silently
 * fail to populate — products would have no slug (breaking every product
 * detail page route), no thumbnail, and isOnSale would never be true even
 * for discounted items. Model.create(array) internally calls .save() for
 * every document, so all three hooks fire correctly. This is a deliberate
 * performance-vs-correctness tradeoff, and correctness wins.
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 * - Product.create() → triggers pre-save hooks (slug, thumbnail, isOnSale)
 * - Delegates to inventory.seeder.js's createInventoryRecords() for the
 *   1:1 Inventory documents and the stockQuantity bulk sync
 *
 * WHY buildDescription() GENERATES COPY FROM features[]:
 * Rather than storing 70 hand-written paragraphs in the data file (a
 * maintenance burden), this composes a natural paragraph from brand +
 * name + the features[] array. This keeps products.data.js focused on
 * facts, and keeps prose-generation logic in one auditable place.
 *
 * IDEMPOTENCY:
 * Checks for an existing product by name+categoryId before creating.
 * If found, skips it (does not duplicate). This means re-running
 * `npm run seed:products` without --reset is safe — it will only create
 * products that don't already exist yet.
 *
 * FUTURE MODULE REUSE:
 * buildDescription() and the paise conversion logic are generically
 * useful — a future "CSV Bulk Product Import" admin feature could import
 * these same helpers rather than reimplementing rupee→paise conversion.
 */

import "dotenv/config";
import { connectDB, Product, Category, User } from "../models.registry.js";
import { productsData } from "../data/products.data.js";
import { categoriesData } from "../data/categories.data.js";
import { buildProductImages } from "../utils/image.util.js";
import { generateRatingProfile } from "../utils/rating.util.js";
import { createSkuGenerator } from "../utils/sku.util.js";
import { createSeededRandom, randomInt } from "../utils/random.util.js";
import { getAdminUser } from "../utils/admin.util.js";
import { logger } from "../utils/logger.util.js";
import SEED_CONFIG from "../seed.config.js";
import seedCategories from "./category.seeder.js";
import createInventoryRecords from "./inventory.seeder.js";

/**
 * buildDescription
 * Composes a natural-language description from brand, name, and a short
 * features list. Kept under the schema's 5000-char max by construction.
 *
 * @param {{name: string, brand: string, features: string[]}} template
 * @returns {string}
 */
function buildDescription({ name, brand, features }) {
  const intro = `${name} by ${brand} is designed to deliver a premium experience with reliable, everyday performance.`;
  const featureSentence = features.length
    ? ` Key highlights include ${features
        .map((f) => f.charAt(0).toLowerCase() + f.slice(1))
        .join("; ")}.`
    : "";
  return `${intro}${featureSentence}`;
}

/**
 * rupeesToPaise
 * Converts a human-readable rupee value to the integer paise your schema
 * requires. Centralised here so this conversion happens in exactly one
 * place across the entire seed system.
 *
 * @param {number} rupees
 * @returns {number}
 */
function rupeesToPaise(rupees) {
  return Math.round(rupees * 100);
}

/**
 * buildProductDocument
 * Transforms one template from products.data.js into a full, schema-valid
 * Product payload ready for Product.create().
 *
 * NOTE: async because buildProductImages() now performs a Pexels keyword
 * search over the network (see image.util.js) rather than a synchronous
 * Picsum URL construction.
 *
 * @param {Object} template - one entry from products.data.js
 * @param {import("mongoose").Types.ObjectId} categoryId
 * @param {import("mongoose").Types.ObjectId} adminId
 * @param {Function} generateSku - stateful SKU generator from sku.util.js
 * @returns {Promise<Object>}
 */
async function buildProductDocument(template, categoryId, adminId, generateSku) {
  const rand = createSeededRandom(template.name);
  const { min, max } = SEED_CONFIG.STOCK_RANGE;
  const stockQuantity = randomInt(rand, min, max);

  const { averageRating, totalReviews, ratingBreakdown } =
    generateRatingProfile(template.name);

  // Pass the full template (not just name) — buildProductImages uses
  // template.tags[0] as the Pexels search keyword for relevant photos
  const images = await buildProductImages(template);

  return {
    // ── Required fields ──────────────────────────────────────────────
    name: template.name,
    description: buildDescription(template),
    sku: generateSku(template.brand, template.name),
    price: rupeesToPaise(template.price),
    categoryId,

    // ── Recommended / realistic fields ───────────────────────────────
    brand: template.brand,
    salePrice: template.salePrice ? rupeesToPaise(template.salePrice) : null,
    currency: SEED_CONFIG.CURRENCY,
    status: SEED_CONFIG.PRODUCT_STATUS,
    isFeatured: Boolean(template.isFeatured),
    tags: template.tags || [],
    attributes: template.attributes || {}, // Mongoose Map SchemaType casts plain objects automatically
    images,

    // ── Ratings — safe to seed directly per confirmed architecture ────
    averageRating,
    totalReviews,
    ratingBreakdown,

    // ── Stock — stockQuantity is provisional here; inventory.seeder.js
    //    re-syncs it via bulkWrite after the Inventory record is created ─
    stockQuantity,
    lowStockThreshold: SEED_CONFIG.DEFAULT_LOW_STOCK_THRESHOLD,
    trackInventory: true,
    allowBackorder: false,

    // ── Audit ─────────────────────────────────────────────────────────
    createdBy: adminId,
    updatedBy: adminId,

    // NOTE: slug intentionally omitted — pre-save hook generates it from name
    // NOTE: thumbnail intentionally omitted — pre-save hook syncs it from images[0]
    // NOTE: isOnSale intentionally omitted — pre-save hook computes it from salePrice
  };
}

/**
 * seedProducts
 * Creates all products across all categories.
 *
 * @param {Object} params
 * @param {import("mongoose").Types.ObjectId} params.adminId
 * @param {Map<string, ObjectId>} params.categoryMap - key → categoryId, from category.seeder.js
 * @returns {Promise<Array>} the created product documents
 */
export async function seedProducts({ adminId, categoryMap }) {
  logger.step("Seeding products");

  const generateSku = createSkuGenerator();
  const createdProducts = [];
  let skippedCount = 0;

  for (const category of categoriesData) {
    const categoryId = categoryMap.get(category.key);
    const templates = productsData[category.key] || [];

    if (!categoryId) {
      logger.warn(`No categoryId resolved for "${category.key}", skipping its products`);
      continue;
    }

    for (const template of templates) {
      // Idempotency guard — skip if a product with this name already
      // exists in this category (avoids duplicates on repeated runs)
      const existing = await Product.findOne({
        name: template.name,
        categoryId,
      });

      if (existing) {
        skippedCount += 1;
        continue;
      }

      const payload = await buildProductDocument(template, categoryId, adminId, generateSku);

      try {
        // Product.create() (NOT insertMany) — see file header for why this matters
        const product = await Product.create(payload);
        createdProducts.push(product);
      } catch (err) {
        logger.error(`Failed to create product "${template.name}": ${err.message}`);
      }
    }

    logger.success(`Processed category: ${category.name}`);
  }

  if (skippedCount > 0) {
    logger.warn(`Skipped ${skippedCount} products that already existed`);
  }
  logger.info(`${createdProducts.length} products created`);

  // ── Inventory: create records + sync stockQuantity via bulkWrite ────
  if (createdProducts.length > 0) {
    await createInventoryRecords(createdProducts);
  }

  return createdProducts;
}

/**
 * Standalone execution guard.
 * `npm run seed:products` runs category seeding first (idempotent — reuses
 * existing categories if present) so products always have valid categoryIds
 * even if run independently of the full `npm run seed` orchestration.
 */
const isRunDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isRunDirectly) {
  (async () => {
    try {
      await connectDB();
      const admin = await getAdminUser(User);
      const categoryMap = await seedCategories({ adminId: admin._id });
      await seedProducts({ adminId: admin._id, categoryMap });
      logger.success("Product seeding complete.");
      process.exit(0);
    } catch (err) {
      logger.error(`Product seeding failed: ${err.message}`);
      console.error(err);
      process.exit(1);
    }
  })();
}

export default seedProducts;