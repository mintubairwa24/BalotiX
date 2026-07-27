# Fix Plan - Review Analytics & Missing Dependencies

## Steps
- [x] Step 1: Install `recharts` package
- [x] Step 2: Create `ReviewRating` component at `client/src/components/admin/reviews/ReviewRating/ReviewRating.jsx`
- [x] Step 3: Update backend `server/src/modules/analytics/services/analytics.service.js` to compute `ratingDistribution`
- [x] Step 4: Update `useReviewAnalytics` hook in `client/src/hooks/useAnalytics.js` to return `ratingDistribution`
- [x] Step 5: Verify all imports and test

