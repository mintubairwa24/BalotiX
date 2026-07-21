/**
 * @file updateProductImages.js
 * @location src/scripts/seed/updateProductImages.js
 *
 * WHY THIS FILE EXISTS:
 * You already ran `npm run seed` successfully before Pexels support was
 * added — your 70 products exist with correct pricing, ratings, stock,
 * and inventory, but their `images` field still points to unrelated
 * Picsum photos. Re-running `npm run seed:reset` would work, but it's
 * overkill: it deletes and recreates everything, including Inventory
 * records, when only ONE field (images) actually needs fixing.
 *
 * This script instead: finds every existing Product, regenerates its
 * `images` array via the new Pexels-backed buildProductImages(), and
 * saves ONLY that field — using .save() (not updateOne) so your schema's
 * pre-save hook still fires and re-syncs `thumbnail` from the new primary
 * image correctly.
 *
 * HOW IT INTEGRATES:
 * Reuses the exact same buildProductImages() from image.util.js that
 * product.seeder.js uses — so newly seeded products and freshly-updated
 * existing products go through identical image-selection logic.
 *
 * WHY .save() INSTEAD OF Product.updateMany():
 * Same reasoning as product.seeder.js: updateMany() bypasses document
 * middleware. Your pre-save hook syncs `thumbnail` from `images[0]` —
 * skipping it here would update `images` but leave the OLD thumbnail
 * displayed on any UI that reads `product.thumbnail` instead of
 * `product.images[0].url`.
 *
 * RATE LIMITING:
 * A small delay is added between each product's Pexels search to stay
 * well within the free tier's 200 requests/hour limit, even though 70
 * products (~140 requests worst case) would comfortably fit without it.
 */

import "dotenv/config";
import mongoose from "mongoose"; // This was already present, but ensuring it's correct.
import { connectDB, Product } from "./models.registry.js";
import { buildProductImages } from "./utils/image.util.js";
import { logger } from "./utils/logger.util.js";

/** Small delay helper to stay comfortably within Pexels rate limits */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateProductImages() {
  logger.step("Updating images on existing products");

  const products = await Product.find({});
  logger.info(`Found ${products.length} existing products`);

  if (!process.env.PEXELS_API_KEY) {
    logger.warn(
      "PEXELS_API_KEY not set — this run will just reshuffle Picsum images, not fix relevance."
    );
    logger.info("Add PEXELS_API_KEY to .env first, then re-run this script.");
  }

  let updatedCount = 0;
  let failedCount = 0;

  for (const product of products) {
    try {
      // Uses the SAME tags/name the product was originally seeded with,
      // so the search query is identical to what product.seeder.js would use
      const images = await buildProductImages({
        name: product.name,
        tags: product.tags,
      });

      product.images = images;
      await product.save(); // triggers pre-save hook → re-syncs thumbnail

      updatedCount += 1;
      logger.success(`Updated images: ${product.name}`);
    } catch (err) {
      failedCount += 1;
      logger.error(`Failed to update "${product.name}": ${err.message}`);
    }

    await sleep(150); // gentle pacing against Pexels rate limits
  }

  logger.summary("Image update complete", [
    ["Products updated", updatedCount],
    ["Failed", failedCount],
  ]);
}

(async () => {
  try {
    await connectDB();
    await updateProductImages();
    process.exit(0);
  } catch (err) {
    logger.error(`Image update failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
})();