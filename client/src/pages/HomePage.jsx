/**
 * src/pages/HomePage.jsx
 *
 * WHY THIS FILE EXISTS:
 *   Compatibility entry point used by the current router. It keeps the
 *   public route contract intact while delegating to the new Phase 4
 *   home page implementation in pages/shop/HomePage.jsx.
 *
 * WHY IT IS REUSABLE:
 *   This wrapper lets us evolve the internal page structure without
 *   forcing route changes or breaking older imports.
 *
 * FUTURE PHASE CONNECTION:
 *   When the router is eventually pointed directly at pages/shop/HomePage,
 *   this file can remain as a backwards-compatible alias or be retired.
 *
 * PRODUCTION ARCHITECTURE NOTE:
 *   Thin re-export files are a production-safe way to migrate page
 *   architecture without causing route churn.
 */

export { default } from "./shop/HomePage";
