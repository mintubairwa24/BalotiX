/**
 * @file reset.js
 * @location src/scripts/seed/reset.js
 *
 * WHY THIS FILE EXISTS:
 * Deletes all documents from Product, Category, and Inventory collections
 * so you can reseed from a clean slate (e.g. after editing products.data.js).
 * This is destructive — it does not selectively remove only seeded
 * documents, it clears these three collections entirely.
 *
 * WHY THE PRODUCTION SAFETY GUARD:
 * This script will happily delete real catalog data if pointed at a real
 * database. Since MONGODB_URI is read from .env and could theoretically be
 * a production connection string, this refuses to run if
 * NODE_ENV=production unless you explicitly pass FORCE_RESET=true. This is
 * the same category of safeguard your payments/orders modules almost
 * certainly already use for destructive operations — consistency with
 * that pattern.
 *
 * HOW IT INTEGRATES:
 * Run via `npm run seed:reset`. index.js also calls this internally when
 * invoked with the `--reset` CLI flag, so `npm run seed -- --reset` does
 * a full wipe-and-reseed in one command.
 *
 * WHY NOT touch Users:
 * Per your explicit scope decision, this seed system never creates or
 * deletes Users — only Product, Category, and Inventory are in scope.
 * The admin user this system depends on is always left untouched.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { connectDB, Product, Category, Inventory } from "./models.registry.js";
import { logger } from "./utils/logger.util.js";

/**
 * resetSeedData
 * Deletes all Product, Category, and Inventory documents.
 * Exits the process if a production safeguard is triggered.
 */
export async function resetSeedData() {
  const isProduction = process.env.NODE_ENV === "production";
  const isForced = process.env.FORCE_RESET === "true";

  if (isProduction && !isForced) {
    logger.error("Refusing to reset: NODE_ENV=production detected.");
    logger.info("If you are certain, re-run with FORCE_RESET=true, e.g.:");
    logger.info("  FORCE_RESET=true npm run seed:reset");
    process.exit(1);
  }

  logger.step("Resetting seed data");

  const [productResult, categoryResult, inventoryResult] = await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Inventory.deleteMany({}),
  ]);

  logger.summary("Reset complete", [
    ["Products deleted", productResult.deletedCount],
    ["Categories deleted", categoryResult.deletedCount],
    ["Inventory deleted", inventoryResult.deletedCount],
  ]);
}

/**
 * Standalone execution guard — `npm run seed:reset`
 */
const isRunDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;

if (isRunDirectly) {
  (async () => {
    try {
      await connectDB();
      await resetSeedData();
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      logger.error(`Reset failed: ${err.message}`);
      console.error(err);
      process.exit(1);
    }
  })();
}

export default resetSeedData;