import "dotenv/config";
import connectDB from "./src/config/db.js";
import Product from "./src/modules/products/models/product.model.js";

await connectDB();

const products = await Product.find({}).limit(8).select("name stockQuantity trackInventory");

console.log("\n✅ ALL PRODUCTS IN DATABASE:\n");
console.log("═".repeat(80));

products.forEach((p, i) => {
  const isInStock = !p.trackInventory ? true : p.stockQuantity > 0;
  const status = isInStock ? "✅ IN STOCK" : "❌ OUT OF STOCK";
  console.log(`${i+1}. ${p.name}`);
  console.log(`   stockQuantity: ${p.stockQuantity} | trackInventory: ${p.trackInventory} | ${status}`);
});

console.log("\n" + "═".repeat(80) + "\n");

process.exit(0);
