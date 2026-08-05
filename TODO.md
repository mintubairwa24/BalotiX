# Fix Featured Products Section (Homepage)

## Issues Fixed
1. Price displayed 100x too high (paise not divided by 100)
2. Product images never rendered (always showed placeholder icon)
3. Duplicate `src/home/FeaturedProducts/` folder (unused)

## Steps
- [x] Step 1: Add real product image URLs to mock data in `home.constants.js` (using picsum.photos with deterministic seeds)
- [x] Step 2: Fix `formatPrice` in `ProductPreviewCard.jsx` to divide paise by 100 with proper formatting
- [x] Step 3: Add `thumbnail` rendering in `ProductPreviewCard.jsx` - show `<img>` when thumbnail exists, fallback placeholder on error
- [x] Step 4: Remove duplicate `src/home/FeaturedProducts/` directory
- [x] Step 5: Verify build compiles successfully

