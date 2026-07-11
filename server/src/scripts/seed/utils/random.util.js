/**
 * @file random.util.js
 * @location src/scripts/seed/utils/random.util.js
 *
 * WHY THIS FILE EXISTS:
 * Plain `Math.random()` gives different ratings/stock numbers every time
 * you run the seeder — which makes "idempotent where practical" impossible
 * for numeric fields. This file solves that with a SEEDED random generator:
 * the same input string (e.g. a product name) always produces the same
 * sequence of "random" numbers.
 *
 * HOW IT WORKS:
 * 1. hashString() turns any string into a 32-bit integer seed.
 * 2. mulberry32() is a small, fast, well-known PRNG algorithm that takes
 *    that integer seed and produces a reproducible sequence of floats.
 *
 * HOW IT INTEGRATES:
 * rating.util.js and product.seeder.js use `createSeededRandom(product.name)`
 * to generate stock counts, review counts, and rating breakdowns that stay
 * IDENTICAL across repeated `npm run seed` runs — but still look randomly
 * distributed across different products.
 *
 * WHY PRODUCTION-READY:
 * This is a standard, widely-used PRNG pattern (mulberry32) — deterministic,
 * fast, and dependency-free. No need to pull in `seedrandom` from npm.
 */

/** Hash any string into a 32-bit integer (djb2-style hash) */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit integer
  }
  return hash >>> 0; // unsigned
}

/** mulberry32 PRNG — takes a 32-bit seed, returns a function that yields floats in [0, 1) */
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * createSeededRandom
 * Returns a deterministic PRNG function keyed off any seed string.
 *
 * @param {string} seedString - e.g. a product name or SKU
 * @returns {Function} rand() → float in [0, 1)
 */
export function createSeededRandom(seedString) {
  return mulberry32(hashString(seedString));
}

/**
 * randomInt
 * Returns a deterministic integer between min and max (inclusive),
 * using the supplied seeded random function.
 *
 * @param {Function} rand - a function from createSeededRandom()
 * @param {number} min
 * @param {number} max
 */
export function randomInt(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

/**
 * randomFloat
 * Returns a deterministic float between min and max, rounded to `decimals` places.
 */
export function randomFloat(rand, min, max, decimals = 1) {
  const value = rand() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

/**
 * pickRandom
 * Deterministically picks one item from an array using the seeded random function.
 */
export function pickRandom(rand, array) {
  return array[Math.floor(rand() * array.length)];
}

export default { createSeededRandom, randomInt, randomFloat, pickRandom };