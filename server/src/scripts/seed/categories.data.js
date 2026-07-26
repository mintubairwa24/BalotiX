/**
 * @file categories.data.js
 * @location src/scripts/seed/data/categories.data.js
 *
 * WHY THIS FILE EXISTS:
 * Pure data, zero logic. Separating "what to seed" (this file) from "how
 * to seed it" (category.seeder.js) means you can add/remove/edit categories
 * without touching any Mongoose or async code.
 *
 * SHAPE:
 * Matches your confirmed Category.create() requirements (Question 12):
 * name, description, image (built at seed-time), status, displayOrder.
 * slug, parentId, ancestors, level, createdBy, updatedBy are intentionally
 * NOT set here — the seeder adds createdBy/updatedBy, and your schema's
 * pre-save hook + defaults handle the rest.
 *
 * HOW IT INTEGRATES:
 * Imported by category.seeder.js. Each entry's `key` is used by
 * products.data.js to associate product templates with the correct
 * category at seed time (avoids hardcoding category names as magic strings
 * in two places).
 *
 * FUTURE REUSE:
 * Extend this array to add more categories — the seeder loops over it
 * generically, no per-category code changes needed.
 */

export const categoriesData = [
  {
    key: "electronics",
    name: "Electronics",
    description: "Smartphones, laptops, cameras, and audio devices from top global brands.",
    displayOrder: 1,
  },
  {
    key: "fashion",
    name: "Fashion",
    description: "Apparel, footwear, watches, and accessories for everyday and formal wear.",
    displayOrder: 2,
  },
  {
    key: "home-kitchen",
    name: "Home & Kitchen",
    description: "Appliances, furniture, and essentials to make your home comfortable.",
    displayOrder: 3,
  },
  {
    key: "sports-fitness",
    name: "Sports & Fitness",
    description: "Equipment and gear for training, outdoor activity, and everyday fitness.",
    displayOrder: 4,
  },
  {
    key: "books",
    name: "Books",
    description: "Bestsellers across self-improvement, business, fiction, and technology.",
    displayOrder: 5,
  },
  {
    key: "beauty-personal-care",
    name: "Beauty & Personal Care",
    description: "Skincare, haircare, and grooming essentials for daily routines.",
    displayOrder: 6,
  },
];

export default categoriesData;