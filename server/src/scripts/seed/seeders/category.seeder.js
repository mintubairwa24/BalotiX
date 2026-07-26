/**
 * @file category.seeder.js
 * @location src/scripts/seed/seeders/category.seeder.js
 *
 * WHY THIS FILE EXISTS:
 * Creates all 6 categories from categories.data.js and returns a
 * { key → categoryId } map. product.seeder.js needs real ObjectIds to
 * satisfy Category's required `categoryId` field on Product — this map
 * is how the two seeders stay decoupled (product.seeder.js never imports
 * categories.data.js directly, it just receives resolved IDs).
 *
 * HOW IT COMMUNICATES WITH THE BACKEND:
 * Uses `Category.create()` (not insertMany) per-document, so your schema's
 * pre-save hook fires correctly (slug auto-generation from name). Category
 * has no complex computed fields beyond slug, so this is a straightforward
 * loop — no bulk shortcuts needed at this volume (6 documents).
 *
 * IDEMPOTENCY:
 * Before creating, checks for an existing category with the same name.
 * If found, reuses its _id instead of creating a duplicate. This means
 * running `npm run seed:categories` twice does NOT create 12 categories —
 * it creates 6 the first time, and reuses them the second time.
 *
 * FUTURE MODULE REUSE:
 * The categoryMap this returns is the same shape a future "Bulk Import"
 * admin feature would need — category name resolution to ObjectId is a
 * generically useful operation, not seed-specific.
 *
 * STANDALONE VS ORCHESTRATED:
 * Exports `seedCategories()` for use by index.js. Also runs standalone
 * when executed directly via `npm run seed:categories`.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, Category, User } from "../models.registry.js";
import { categoriesData } from "../data/categories.data.js";
import { buildCategoryImage } from "../utils/image.util.js";
import { getAdminUser } from "../utils/admin.util.js";
import { logger } from "../utils/logger.util.js";
import SEED_CONFIG from "../seed.config.js";

/**
 * seedCategories
 * Creates (or reuses) all categories defined in categories.data.js.
 *
 * @param {Object} params
 * @param {import("mongoose").Types.ObjectId} params.adminId
 * @returns {Promise<Map<string, import("mongoose").Types.ObjectId>>} key → categoryId
 */
export async function seedCategories({ adminId }) {
  logger.step("Seeding categories");

  const categoryMap = new Map();

  for (const template of categoriesData) {
    // Idempotency guard — reuse existing category instead of duplicating
    const existing = await Category.findOne({ name: template.name });

    if (existing) {
      logger.warn(`Category already exists, reusing: ${template.name}`);
      categoryMap.set(template.key, existing._id);
      continue;
    }

    const category = await Category.create({
      name: template.name,
      description: template.description,
      image: buildCategoryImage(template.name),
      status: SEED_CONFIG.CATEGORY_STATUS,
      displayOrder: template.displayOrder,
      createdBy: adminId,
      updatedBy: adminId,
      // slug, parentId, ancestors, level intentionally omitted — schema defaults/hooks handle these
    });

    logger.success(`Created category: ${category.name} (${category.slug})`);
    categoryMap.set(template.key, category._id);
  }

  logger.info(`${categoryMap.size} categories ready`);
  return categoryMap;
}

/**
 * Standalone execution guard.
 * Allows `npm run seed:categories` to work independently of index.js.
 */
const isRunDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isRunDirectly) {
  (async () => {
    try {
      await connectDB();
      const admin = await getAdminUser(User);
      await seedCategories({ adminId: admin._id });
      logger.success("Category seeding complete.");
    } catch (err) {
      logger.error(`Category seeding failed: ${err.message}`);
      console.error(err);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      process.exit(0);
    }
  })();
}

export default seedCategories;