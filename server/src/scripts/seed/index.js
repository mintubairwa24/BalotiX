/**
 * @file index.js
 * @location src/scripts/seed/index.js
 *
 * WHY THIS FILE EXISTS:
 * This is the single entry point for `npm run seed` — the modular
 * replacement for the single-file src/scripts/seedData.js originally
 * sketched in the architecture doc. It runs the EXACT pipeline specified
 * in that doc's Summary section, just composed from separate, independently
 * testable/runnable seeder modules instead of one monolithic file.
 *
 * PIPELINE (matches your doc's Summary exactly):
 *   1. Load .env
 *   2. Connect to MongoDB via connectDB()
 *   3. Find admin user (exit if none)
 *   4. OPTIONAL: clear existing data (via --reset flag)
 *   5. Create Categories (save _ids for use in Product.categoryId)
 *   6. Create Products, each followed by its Inventory record + stock sync
 *   7. Close connection
 *   8. Print summary
 *
 * HOW IT INTEGRATES:
 * Imports seedCategories from category.seeder.js and seedProducts from
 * product.seeder.js as plain functions (not standalone scripts) — this is
 * why both seeder files export their logic AND guard their standalone
 * execution behind an `isRunDirectly` check. Same source of truth, two
 * entry points.
 *
 * WHY PRODUCTION-READY:
 * - Single try/catch/finally ensures the MongoDB connection always closes,
 *   even on failure — no hanging processes.
 * - --reset is opt-in via CLI flag, never accidental.
 * - Exit codes are meaningful (0 = success, 1 = failure) for CI/script chaining.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, User, Product, Category } from "./models.registry.js";
import { getAdminUser } from "./utils/admin.util.js";
import { logger } from "./utils/logger.util.js";
import { resetSeedData } from "./reset.js";
import seedCategories from "./seeders/category.seeder.js";
import seedProducts from "./seeders/product.seeder.js";

async function run() {
  const shouldReset = process.argv.includes("--reset");

  logger.step("Connecting to database");
  await connectDB();
  logger.success("Database connected");

  const admin = await getAdminUser(User);

  if (shouldReset) {
    await resetSeedData();
  }

  const categoryMap = await seedCategories({ adminId: admin._id });
  const products = await seedProducts({ adminId: admin._id, categoryMap });

  // Final counts pulled fresh from the DB, not just in-memory arrays —
  // gives an accurate picture even on partial/idempotent reruns.
  const totalCategories = await Category.countDocuments();
  const totalProducts = await Product.countDocuments();

  logger.summary("NexCart demo catalog seeded", [
    ["Categories in DB", totalCategories],
    ["Products in DB", totalProducts],
    ["Products created this run", products.length],
  ]);
}

run()
  .catch((err) => {
    logger.error(`Seeding failed: ${err.message}`);
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
    logger.info("Database connection closed");
  });