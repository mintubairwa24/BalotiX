/**
 * src/components/home/Hero/index.js
 *
 * WHY THIS FILE EXISTS:
 *   Provides the public export surface for the Hero feature folder.
 *   Consumers import from the folder instead of reaching into internals.
 *
 * WHY IT IS REUSABLE:
 *   The folder stays easy to move, extend, or split in later phases while
 *   the import contract remains stable.
 *
 * FUTURE PHASE CONNECTION:
 *   Phase 5 and beyond can add additional hero variants here without
 *   changing any page-level imports.
 */

export { Hero } from "./Hero";
export { HeroContent } from "./HeroContent";
export { HeroImage } from "./HeroImage";
