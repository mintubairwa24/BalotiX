/**
 * FILE: src/hooks/useAdminReviews.js
 *
 * ============================================================================
 * useAdminReviews â€” Phase 18G (Admin Review Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * React Query boundary between the admin-only Axios helpers in
 * src/services/admin.service.js and the reviews admin UI. Owns cache
 * keys, response unwrapping, and invalidation for moderation actions.
 *
 * BACKEND COMMUNICATION:
 * - useAdminReviewsList(params) â†’ admin.service.js#getAdminReviews(params)
 *   â†’ GET /admin/reviews?page=&limit=&search=&moderationStatus=&rating=&sortBy=&sortOrder=
 * - useAdminReviewDetail(reviewId) â†’ admin.service.js#getAdminReviewById(reviewId)
 *   â†’ GET /admin/reviews/:id
 * - useHideAdminReview() â†’ admin.service.js#hideAdminReview(reviewId)
 *   â†’ PATCH /admin/reviews/:id/hide
 * - useRestoreAdminReview() â†’ admin.service.js#restoreAdminReview(reviewId)
 *   â†’ PATCH /admin/reviews/:id/restore
 * - useDeleteAdminReview() â†’ admin.service.js#deleteAdminReview(reviewId)
 *   â†’ DELETE /admin/reviews/:id
 *
 * PRODUCTION-READY BECAUSE:
 * - List and detail are separate query keys, so the detail screen can
 *   cache independently from the paginated list.
 * - Mutations invalidate the whole reviews family and the specific detail
 *   key when possible, so the list, detail page, and any cached page all
 *   stay in sync after moderation.
 */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteAdminReview,
  getAdminReviewById,
  getAdminReviews,
  hideAdminReview,
  restoreAdminReview,
} from "../services/admin.service";

const REVIEWS_QUERY_KEY = ["admin", "reviews"];
const reviewDetailKey = (reviewId) => ["admin", "reviews", "detail", reviewId];

export const useAdminReviewsList = (params = {}) => {
  const query = useQuery({
    queryKey: [...REVIEWS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await getAdminReviews(params);
      return response.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  return {
    reviews: query.data?.reviews ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useAdminReviewDetail = (reviewId) => {
  const query = useQuery({
    queryKey: reviewDetailKey(reviewId),
    queryFn: async () => {
      const response = await getAdminReviewById(reviewId);
      return response.data.data.review;
    },
    enabled: Boolean(reviewId),
    staleTime: 30 * 1000,
  });

  return {
    review: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

const invalidateReviews = (queryClient, reviewId) => {
  queryClient.invalidateQueries({ queryKey: REVIEWS_QUERY_KEY });
  if (reviewId) {
    queryClient.invalidateQueries({ queryKey: reviewDetailKey(reviewId) });
  }
};

export const useHideAdminReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) => hideAdminReview(reviewId),
    onSuccess: (_response, reviewId) => invalidateReviews(queryClient, reviewId),
  });
};

export const useRestoreAdminReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) => restoreAdminReview(reviewId),
    onSuccess: (_response, reviewId) => invalidateReviews(queryClient, reviewId),
  });
};

export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reviewId) => deleteAdminReview(reviewId),
    onSuccess: (_response, reviewId) => invalidateReviews(queryClient, reviewId),
  });
};
