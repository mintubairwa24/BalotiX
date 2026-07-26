/**
 * src/components/home/Hero/index.js
 *
 * WHY THIS FILE EXISTS:
 *   Barrel export — the public API surface of the Hero feature folder.
 *   Consumers import from the folder, not from individual files:
 *     import { Hero } from "../Hero";
 *
 * WHY THIS IS PRODUCTION ARCHITECTURE:
 *   Internal files (HeroContent, HeroImage) can be renamed, split, or
 *   merged without breaking any import outside this folder.
 *   Only Hero is exported — HeroContent and HeroImage are intentionally
 *   kept internal (implementation details, not public API).
 */

export { Hero } from "./Hero";