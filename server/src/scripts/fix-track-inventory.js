/**
 * Fix Track Inventory Migration
 *
 * This script fixes all existing products that have trackInventory: false
 * (from the old incorrect validation default).
 *
 * After running this:
 * - All products will have trackInventory: true by default
 * - Stock badges will display correctly based on stockQuantity
 * - The isInStock virtual will work as intended
 *
 * RUN WITH: node src/scripts/fix-track-inventory.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import Product from "../modules/products/models/product.model.js";
import connectDB from "../config/db.js";

async function fixTrackInventory() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();

    console.log("📊 Fetching products with trackInventory: false...");
    const productsToFix = await Product.find({ trackInventory: false });

    if (productsToFix.length === 0) {
      console.log("✅ No products need fixing. All products have trackInventory: true");
      process.exit(0);
    }

    console.log(`\n⚠️  Found ${productsToFix.length} product(s) that need fixing:\n`);

    // Show which products will be fixed
    productsToFix.forEach((product) => {
      console.log(`  • ${product.name} (ID: ${product._id})`);
    });

    console.log(`\n🔄 Setting trackInventory to true for all ${productsToFix.length} product(s)...`);

    // Update all products
    const result = await Product.updateMany(
      { trackInventory: false },
      { trackInventory: true }
    );

    console.log(`\n✅ Migration successful!`);
    console.log(`   - Modified: ${result.modifiedCount} product(s)`);
    console.log(`   - Matched: ${result.matchedCount} product(s)`);

    console.log("\n📝 Changes:\n");
    console.log("  BEFORE: trackInventory: false → isInStock always TRUE (BUG)");
    console.log("  AFTER:  trackInventory: true  → isInStock depends on stockQuantity");

    console.log("\n💡 What this means for your products:\n");
    console.log("  ✓ Products with stockQuantity > 0 → Show as 'In Stock'");
    console.log("  ✓ Products with stockQuantity = 0 → Show as 'Out of Stock'");
    console.log("  ✓ Products with 0 < stockQuantity ≤ lowStockThreshold → Show 'Low Stock'");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during migration:", error);
    process.exit(1);
  }
}

fixTrackInventory();
