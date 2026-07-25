/**
 * fix-product-data.js
 *
 * PURPOSE (REVISED):
 * This is a comprehensive data repair script to fix products that are in a
 * non-viewable or incomplete state (e.g., 'inactive' or 'draft') and may be
 * missing images. This issue causes them to appear broken in the admin panel,
 * with no photos and disabled actions. This script ensures all non-archived
 * products are made 'active' and have a valid set of images.
 *
 * WHAT IT DOES:
 * 1. Connects to the database.
 * 2. Finds all products with a status of 'inactive' or 'draft'.
 * 3. For each of these products, it checks if the `images` array is empty.
 *    If it is, it generates a new set of images.
 * 4. It then unconditionally updates the product's status to 'active'.
 * 5. It saves the product, which also triggers the pre-save hook to update the thumbnail.
 *
 * HOW TO RUN:
 *   node src/scripts/fix-product-data.js
 *
 * After running, the products will be correctly displayed and editable in the
 * admin dashboard.
 */

import "dotenv/config";
import mongoose from "mongoose";
import Product from "../modules/products/models/product.model.js";
import connectDB from "../config/db.js";
import { buildProductImages } from "./seed/utils/image.util.js";

async function fixProducts() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();

    console.log("📊 Fetching all products that are 'inactive' or 'draft'...");
    const productsToFix = await Product.find({
      status: { $in: ["inactive", "draft"] },
    });

    if (productsToFix.length === 0) {
      console.log("✅ No products found that need fixing.");
      return;
    }

    console.log(`\n⚠️  Found ${productsToFix.length} product(s) to fix:\n`);
    productsToFix.forEach((p) => console.log(`  • ${p.name} (ID: ${p._id})`));

    console.log(`\n🔄 Fixing ${productsToFix.length} product(s)...`);
    let fixedCount = 0;
    for (const product of productsToFix) {
      try {
        // If images are missing, generate them.
        if (product.images.length === 0) {
          console.log(`  -> Generating images for "${product.name}"...`);
          const newImages = await buildProductImages({ name: product.name, tags: product.tags });
          product.images = newImages;
        }

        // Always set the status to active.
        product.status = "active";
        await product.save(); // .save() will trigger pre-save hooks (e.g., for thumbnail)
        console.log(`  -> ✓ Fixed and activated "${product.name}"`);
        fixedCount++;
      } catch (e) {
        console.error(`  -> ❌ Failed to fix product "${product.name}":`, e.message);
      }
    }

    console.log(`\n✅ Migration complete. Fixed ${fixedCount} of ${productsToFix.length} product(s).`);
    console.log("💡 Your admin panel should now show product photos and allow actions.");
  } catch (error) {
    console.error("❌ A critical error occurred during the migration script:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Database connection closed.");
  }
}

fixProducts();