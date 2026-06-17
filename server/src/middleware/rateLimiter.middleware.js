/**
 * rateLimiter.middleware.js
 *
 * WHO CALLS IT:
 *   product.routes.js applies productRateLimiter to write routes and
 *   publicRateLimiter to read routes. Other module routes will do the same.
 *
 * WHY IT EXISTS:
 *   Rate limiting is a first line of defence against:
 *     - Brute-force attacks on write endpoints (mass product creation scripts)
 *     - Scraping attacks on listing/search endpoints
 *     - DDoS amplification from public endpoints
 *
 *   We define different limiters for different risk profiles:
 *     - publicRateLimiter:  generous, for read-only public routes
 *     - productRateLimiter: tight, for admin write routes
 *
 * LIBRARY: express-rate-limit (already in your tech stack)
 *
 * WINDOW / MAX EXPLANATION:
 *   windowMs: 15 * 60 * 1000 = 15-minute sliding window
 *   max: 100 = up to 100 requests per IP per window
 *   After 100 requests, the 101st gets a 429 Too Many Requests response.
 */

import rateLimit from "express-rate-limit";

/**
 * publicRateLimiter
 * Applied to all public read routes (GET /products, GET /products/:id, etc.)
 * Generous limits — a real user browsing a catalogue makes many requests.
 */
export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                  // 200 requests per IP per window
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
  // Skip rate limiting for trusted IPs (useful for admin dashboards)
  skip: (req) => req.ip === process.env.TRUSTED_ADMIN_IP,
});

/**
 * productRateLimiter
 * Applied to admin write routes (POST, PUT, PATCH, DELETE).
 * Tight limits — an admin dashboard does not need to create 50 products/minute.
 * Unusual bursts likely indicate a script attack or misconfiguration.
 */
export const productRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,                   // 50 write requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many write requests. Please slow down.",
  },
});