/**
 * @file models.registry.js
 * @location src/scripts/seed/models.registry.js
 *
 * WHY THIS FILE EXISTS:
 * Every seeder needs User, Product, Category, Inventory, and connectDB.
 * Instead of each of the 5 seed files guessing the relative path to these
 * independently (fragile — one wrong guess breaks the whole run), this
 * file is the ONLY place that imports them directly from your real
 * project structure. Every other seed file imports from HERE instead.
 *
 * IF YOU GET "Cannot find module" ERRORS:
 * You only need to fix the 5 import paths below — nowhere else.
 * Update each path to match where the file actually lives in YOUR project,
 * then re-run `npm run seed`. No other file in the seed system needs touching.
 *
 * HOW TO FIND THE CORRECT PATHS:
 * Open your `server` folder in VS Code and use its file explorer sidebar,
 * or run this in your server folder's terminal:
 *
 *   PowerShell:  Get-ChildItem -Recurse -Include *.model.js,db.js
 *   Mac/Linux:   find . -name "*.model.js" -o -name "db.js"
 *
 * Then rewrite the import paths below to match — paths are relative to
 * THIS file's location: src/scripts/seed/models.registry.js
 */

// ─────────────────────────────────────────────────────────────────────
// ✏️  EDIT ONLY THESE 5 LINES TO MATCH YOUR ACTUAL PROJECT STRUCTURE
// ─────────────────────────────────────────────────────────────────────

import connectDB from "../../config/db.js";
import User from "../../modules/auth/models/user.model.js";
import Product from "../../modules/products/models/product.model.js";
import Category from "../../modules/categories/models/category.model.js";
import Inventory from "../../modules/inventory/models/inventory.model.js";

// ─────────────────────────────────────────────────────────────────────
// Nothing below this line needs editing.
// ─────────────────────────────────────────────────────────────────────

export { connectDB, User, Product, Category, Inventory };