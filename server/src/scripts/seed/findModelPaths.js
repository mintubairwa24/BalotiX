/**
 * @file findModelPaths.js
 * @location src/scripts/seed/findModelPaths.js
 *
 * WHY THIS FILE EXISTS:
 * models.registry.js needs 5 exact import paths (User, Product, Category,
 * Inventory, connectDB), and repeated guessing at those paths has failed
 * twice now. Rather than guess a third time, this script walks your ENTIRE
 * src/ folder, finds files that look like each required model, and prints
 * the exact corrected import line to paste into models.registry.js.
 *
 * HOW TO USE:
 *   node src/scripts/seed/findModelPaths.js
 *
 * This is a one-time diagnostic tool — not part of the seeding pipeline
 * itself, and safe to delete after models.registry.js is fixed.
 *
 * WHY PLAIN fs/path (no project imports):
 * Deliberately imports NOTHING from your project — only Node's built-in
 * fs and path modules. This means it cannot fail with the same
 * ERR_MODULE_NOT_FOUND error it's trying to help you diagnose.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This file lives at src/scripts/seed/ — walk up to project root, then into src/
const SRC_ROOT = path.resolve(__dirname, "../../"); // → .../server/src

/** Patterns to match each required file, case-insensitive */
const TARGETS = [
  { key: "connectDB", pattern: /^db\.js$/i, exportName: "connectDB (default export)" },
  { key: "User", pattern: /user.*model.*\.js$/i, exportName: "User (default export)" },
  { key: "Product", pattern: /product.*model.*\.js$/i, exportName: "Product (default export)" },
  { key: "Category", pattern: /categor.*model.*\.js$/i, exportName: "Category (default export)" },
  { key: "Inventory", pattern: /inventor.*model.*\.js$/i, exportName: "Inventory (default export)" },
];

const IGNORE_DIRS = new Set(["node_modules", ".git", "dist", "build"]);

/** Recursively walk a directory, returning all file paths */
function walk(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Convert an absolute file path into a relative import path from models.registry.js's folder */
function toImportPath(absoluteFilePath) {
  const registryDir = __dirname; // src/scripts/seed/
  let rel = path.relative(registryDir, absoluteFilePath).split(path.sep).join("/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

console.log("\n🔍 Scanning", SRC_ROOT, "for model files...\n");

const allFiles = walk(SRC_ROOT);

const foundLines = [];
const notFound = [];

for (const target of TARGETS) {
  const matches = allFiles.filter((f) => target.pattern.test(path.basename(f)));

  if (matches.length === 0) {
    notFound.push(target.key);
    continue;
  }

  if (matches.length > 1) {
    console.log(`⚠  Multiple files matched "${target.key}" — pick the correct one:`);
    matches.forEach((m) => console.log(`     ${toImportPath(m)}`));
    console.log("");
  }

  // Use the first match for the suggested import line (or the only match)
  const chosen = matches[0];
  const importLine =
    target.key === "connectDB"
      ? `import connectDB from "${toImportPath(chosen)}";`
      : `import ${target.key} from "${toImportPath(chosen)}";`;

  foundLines.push(importLine);
}

console.log("─────────────────────────────────────────────────────────");
console.log("PASTE THESE LINES INTO models.registry.js (replacing the");
console.log("current 5 import lines at the top of the file):");
console.log("─────────────────────────────────────────────────────────\n");

foundLines.forEach((line) => console.log(line));

if (notFound.length > 0) {
  console.log("\n⚠  Could NOT auto-find these — you'll need to locate manually:");
  notFound.forEach((key) => console.log(`   - ${key}`));
  console.log("\n   Open your project in VS Code, use Ctrl+Shift+F (search all files),");
  console.log("   search for \"mongoose.Schema\" to find model files, or search for");
  console.log("   \"mongoose.connect\" to find your db connection file.");
}

console.log("");