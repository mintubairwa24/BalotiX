/**
 * @file rating.util.js
 * @location src/scripts/seed/utils/rating.util.js
 *
 * WHY THIS FILE EXISTS:
 * Per your confirmed architecture (Question 1), averageRating, totalReviews,
 * and ratingBreakdown are STORED static fields on Product, explicitly safe
 * to seed directly. This utility generates realistic values for all three
 * in one consistent operation, so they always agree with each other
 * (e.g. averageRating is actually the weighted mean of ratingBreakdown,
 * not an unrelated random number).
 *
 * WHY POSITIVELY SKEWED:
 * Real e-commerce rating distributions cluster toward 4-5 stars (people who
 * bother leaving a review are disproportionately satisfied customers).
 * A uniform 1-5 distribution would look fake. The WEIGHTS below approximate
 * a realistic skew.
 *
 * HOW IT INTEGRATES:
 * product.seeder.js calls generateRatingProfile(productName) while building
 * each product document. The Review module's recalculateProductRating()
 * will silently overwrite these values the moment a real review is created
 * against a seeded product — exactly as your architecture intends.
 *
 * DETERMINISM:
 * Uses createSeededRandom(productName) from random.util.js, so the same
 * product always gets the same rating profile across repeated seed runs.
 */

import { createSeededRandom, randomInt } from "./random.util.js";
import SEED_CONFIG from "../seed.config.js";

/** Approximate real-world skew toward positive ratings */
const RATING_WEIGHTS = { 1: 0.02, 2: 0.03, 3: 0.1, 4: 0.35, 5: 0.5 };

/**
 * generateRatingProfile
 *
 * @param {string} productName - used as the deterministic seed
 * @returns {{
 *   averageRating: number,
 *   totalReviews: number,
 *   ratingBreakdown: { "1": number, "2": number, "3": number, "4": number, "5": number }
 * }}
 */
export function generateRatingProfile(productName) {
  const rand = createSeededRandom(productName);
  const { min, max } = SEED_CONFIG.REVIEW_COUNT_RANGE;
  const totalReviews = randomInt(rand, min, max);

  // Distribute totalReviews across 1-5 stars according to RATING_WEIGHTS
  const breakdown = {};
  let allocated = 0;

  for (const star of [1, 2, 3, 4]) {
    const count = Math.round(totalReviews * RATING_WEIGHTS[star]);
    breakdown[star] = count;
    allocated += count;
  }
  // 5-star absorbs the rounding remainder so the sum always equals totalReviews exactly
  breakdown[5] = Math.max(0, totalReviews - allocated);

  // Compute the true weighted average from the breakdown (never a disconnected random number)
  const weightedSum = [1, 2, 3, 4, 5].reduce(
    (sum, star) => sum + star * breakdown[star],
    0
  );
  const averageRating =
    totalReviews > 0 ? parseFloat((weightedSum / totalReviews).toFixed(1)) : 0;

  // ratingBreakdown keys are strings per your schema ("1".."5")
  const ratingBreakdown = {
    "1": breakdown[1],
    "2": breakdown[2],
    "3": breakdown[3],
    "4": breakdown[4],
    "5": breakdown[5],
  };

  return { averageRating, totalReviews, ratingBreakdown };
}

export default generateRatingProfile;