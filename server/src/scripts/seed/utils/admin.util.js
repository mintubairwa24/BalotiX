/**
 * @file admin.util.js
 * @location src/scripts/seed/utils/admin.util.js
 *
 * WHY THIS FILE EXISTS:
 * Both Product and Category require a `createdBy: ObjectId` referencing an
 * existing User (confirmed in Question 7 of your architecture doc). This
 * utility centralises that lookup so every seeder — category, product, and
 * any future seeder — resolves the admin the exact same way.
 *
 * HOW IT INTEGRATES:
 * Imported by index.js (orchestrated runs) and by each seeder's standalone
 * entry point (`npm run seed:categories`, `npm run seed:products`).
 *
 * WHY IT EXITS THE PROCESS ON FAILURE:
 * Per your doc: "If no admin exists, exit with clear error." Continuing
 * without a valid createdBy would cause every single Product/Category
 * .save() to throw a ValidationError — better to fail fast with one clear
 * message than 70 stack traces.
 *
 * IMPORTANT — DOES NOT IMPORT THE MODEL DIRECTLY:
 * The User model is passed in as an argument rather than imported here.
 * This keeps admin.util.js decoupled from your exact User model path,
 * so if that path ever changes, only the caller needs updating.
 */

import { logger } from "./logger.util.js";
import SEED_CONFIG from "../seed.config.js";

/**
 * getAdminUser
 * Finds the admin user used as createdBy/updatedBy for all seeded documents.
 * Exits the process with a clear message if none exists.
 *
 * @param {import("mongoose").Model} UserModel - the User Mongoose model
 * @returns {Promise<import("mongoose").Document>} the admin user document
 */
export async function getAdminUser(UserModel) {
  const admin = await UserModel.findOne({ role: SEED_CONFIG.ADMIN_ROLE });

  if (!admin) {
    logger.error("No admin user found in the database.");
    logger.info("Run your existing admin-creation script first, e.g.:");
    logger.info("  node src/scripts/createAdmin.js");
    process.exit(1);
  }

  logger.success(`Admin user resolved: ${admin.email || admin._id}`);
  return admin;
}

export default getAdminUser;