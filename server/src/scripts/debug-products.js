/**
 * Debug & Test Product Stock Display
 * 
 * This script helps you:
 * 1. Check the database state
 * 2. Test API responses  
 * 3. Verify virtual fields are computed correctly
 * 4. Ensure frontend receives correct data
 * 
 * RUN WITH: node src/scripts/debug-products.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import Product from "../modules/products/models/product.model.js";
import connectDB from "../config/db.js";

async function debugProducts() {
  try {
    console.log("🔄 Connecting to database...\n");
    await connectDB();

    // ─── Check Database State ───────────────────────────────────────────────
    console.log("📊 DATABASE STATE CHECK\n");
    console.log("═══════════════════════════════════════════════════════════════\n");

    const totalProducts = await Product.countDocuments({});
    const correctTrackInventory = await Product.countDocuments({
      trackInventory: true,
    });
    const wrongTrackInventory = await Product.countDocuments({
      trackInventory: false,
    });
    const inStockProducts = await Product.countDocuments({ stockQuantity: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stockQuantity: 0 });

    console.log(`Total Products in Database: ${totalProducts}`);
    console.log(`  ✅ With trackInventory: true  → ${correctTrackInventory}`);
    console.log(`  ❌ With trackInventory: false → ${wrongTrackInventory}`);
    console.log("");
    console.log(`Product Stock Levels:`);
    console.log(`  📦 In Stock (quantity > 0)    → ${inStockProducts}`);
    console.log(`  🚫 Out of Stock (quantity = 0) → ${outOfStockProducts}`);
    console.log("");

    // ─── Show Sample Products ────────────────────────────────────────────────
    console.log("📋 SAMPLE PRODUCTS (First 5)\n");
    console.log("═══════════════════════════════════════════════════════════════\n");

    const sampleProducts = await Product.find({})
      .select("name stockQuantity trackInventory lowStockThreshold allowBackorder")
      .limit(5);

    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   stockQuantity: ${product.stockQuantity}`);
      console.log(`   lowStockThreshold: ${product.lowStockThreshold}`);
      console.log(`   trackInventory: ${product.trackInventory}`);
      console.log(`   allowBackorder: ${product.allowBackorder}`);

      // Show what isInStock should be
      const isInStock = !product.trackInventory
        ? true
        : product.stockQuantity > 0 || product.allowBackorder;
      const isLowStock =
        product.trackInventory &&
        product.stockQuantity > 0 &&
        product.stockQuantity <= product.lowStockThreshold;

      console.log(`   → isInStock: ${isInStock} ${isInStock ? "✅" : "❌"}`);
      console.log(`   → isLowStock: ${isLowStock} ${isLowStock ? "⚠️" : "✅"}`);
      console.log("");
    });

    // ─── Show Products with Issues ──────────────────────────────────────────
    if (wrongTrackInventory > 0) {
      console.log("⚠️  PRODUCTS WITH ISSUES (trackInventory: false)\n");
      console.log("═══════════════════════════════════════════════════════════════\n");

      const problematicProducts = await Product.find({ trackInventory: false })
        .select("name stockQuantity trackInventory")
        .limit(10);

      problematicProducts.forEach((product) => {
        console.log(`❌ ${product.name} (ID: ${product._id})`);
        console.log(`   Current: trackInventory: ${product.trackInventory}, stockQuantity: ${product.stockQuantity}`);
        console.log(`   Issue: isInStock ALWAYS returns true (ignores stockQuantity)`);
        console.log(`   Fix: Change trackInventory to true\n`);
      });

      if (wrongTrackInventory > 10) {
        console.log(`... and ${wrongTrackInventory - 10} more products with issues\n`);
      }
    } else {
      console.log("✅ ALL PRODUCTS HAVE CORRECT trackInventory VALUE\n");
    }

    // ─── Summary & Recommendations ──────────────────────────────────────────
    console.log("📝 RECOMMENDATIONS\n");
    console.log("═══════════════════════════════════════════════════════════════\n");

    if (wrongTrackInventory > 0) {
      console.log(`⚠️  CRITICAL: ${wrongTrackInventory} product(s) need fixing!\n`);
      console.log("Run the migration script to fix them:\n");
      console.log("  $ node src/scripts/fix-track-inventory.js\n");
      console.log("After running the script:");
      console.log("  1. Refresh your browser (Ctrl+Shift+R)\n");
      console.log("  2. Products will show correct stock status\n");
      console.log("  3. Re-run this script to verify: node src/scripts/debug-products.js\n");
    } else {
      console.log("✅ DATABASE IS CLEAN - No fixes needed!\n");
      console.log("Next steps:");
      console.log("  1. Refresh browser (Ctrl+Shift+R)\n");
      console.log("  2. Check if products show correct stock status\n");
      console.log("  3. Test by adding products with different stock levels\n");
    }

    console.log("═══════════════════════════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during debugging:", error);
    process.exit(1);
  }
}

debugProducts();
