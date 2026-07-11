/**
 * @file pexels.util.js
 * @location src/scripts/seed/utils/pexels.util.js
 *
 * WHY THIS FILE EXISTS:
 * Picsum (the original image source) only supports SEEDED RANDOM photos —
 * it has no keyword search. That's why seeded products showed unrelated
 * images (landscapes, strangers, random objects) instead of anything
 * resembling the actual product. Unsplash Source, the other common free
 * option, was fully shut down in 2024 and no longer resolves at all.
 *
 * Pexels is the current viable free option: it has a real search endpoint,
 * an instant self-serve API key (no approval wait), and a generous free
 * tier (200 req/hour, 20,000 req/month) — comfortably enough for a 70
 * product catalog even with retries.
 *
 * HOW IT INTEGRATES:
 * image.util.js calls searchPexelsPhotos(query) to fetch REAL, relevant
 * photos for a given search term (e.g. "smartphone", "sneakers",
 * "yoga mat"). Falls back gracefully to null if the API key is missing,
 * the search fails, or no results are found — callers must handle that
 * fallback (image.util.js falls back to Picsum in that case).
 *
 * WHY CACHING MATTERS:
 * Many products share a search term (e.g. multiple "books" or "shoes").
 * Without caching, that's a duplicate API call per product for the same
 * results. This in-memory cache (scoped to one seeding run) stores each
 * query's results once, and callers round-robin through them so products
 * sharing a query still get DIFFERENT photos, not identical ones.
 *
 * WHY PRODUCTION-READY:
 * - Uses Node's built-in fetch — zero new dependencies.
 * - Fails soft (returns null / empty array) rather than crashing a 70-item
 *   seeding run over one bad network response.
 * - Respects Pexels' free tier via response-header rate limit logging.
 */

import { logger } from "./logger.util.js";

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";

/** In-memory cache: query string → array of photo URLs. Scoped to one run. */
const queryCache = new Map();

/** Round-robin counters per query, so repeated queries return different photos */
const queryCounters = new Map();

let hasWarnedMissingKey = false;

/**
 * searchPexelsPhotos
 * Searches Pexels for a keyword and returns an array of large-size photo URLs.
 * Results are cached per query for the lifetime of the current process.
 *
 * @param {string} query - search term, e.g. "smartphone", "running shoes"
 * @param {number} perPage - how many results to fetch (default 6)
 * @returns {Promise<string[]>} array of secure image URLs, empty on failure
 */
export async function searchPexelsPhotos(query, perPage = 6) {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    if (!hasWarnedMissingKey) {
      logger.warn(
        "PEXELS_API_KEY not set — falling back to Picsum (unrelated random images)."
      );
      logger.info("Get a free key instantly at https://www.pexels.com/api/");
      hasWarnedMissingKey = true;
    }
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (queryCache.has(normalizedQuery)) {
    return queryCache.get(normalizedQuery);
  }

  try {
    const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(normalizedQuery)}&per_page=${perPage}&orientation=square`;
    const response = await fetch(url, {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) {
      logger.warn(`Pexels search failed for "${query}" (HTTP ${response.status})`);
      queryCache.set(normalizedQuery, []);
      return [];
    }

    const data = await response.json();
    const urls = (data.photos || []).map((photo) => photo.src.large);

    queryCache.set(normalizedQuery, urls);
    queryCounters.set(normalizedQuery, 0);

    return urls;
  } catch (err) {
    logger.warn(`Pexels request error for "${query}": ${err.message}`);
    queryCache.set(normalizedQuery, []);
    return [];
  }
}

/**
 * getNextPexelsPhoto
 * Returns the next photo URL for a query, round-robining through cached
 * results so multiple products sharing a query don't all get the same photo.
 * Must be called AFTER searchPexelsPhotos() has populated the cache for that query.
 *
 * @param {string} query
 * @returns {string|null}
 */
export function getNextPexelsPhoto(query) {
  const normalizedQuery = query.trim().toLowerCase();
  const urls = queryCache.get(normalizedQuery) || [];
  if (urls.length === 0) return null;

  const counter = queryCounters.get(normalizedQuery) || 0;
  const photo = urls[counter % urls.length];
  queryCounters.set(normalizedQuery, counter + 1);

  return photo;
}

export default { searchPexelsPhotos, getNextPexelsPhoto };