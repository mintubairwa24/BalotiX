/**
 * FILE: src/hooks/useAdminCoupons.js
 *
 * ============================================================================
 * useAdminCoupons — Phase 18E (Admin Coupon Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The React Query boundary between the pure-Axios service files
 * (admin.service.js, coupon.service.js) and the Coupons UI. Owns cache
 * keys, response unwrapping, and derives the list query's params straight
 * from adminCoupons.store.js — exact sibling of useAdminProducts.js,
 * useAdminCategories.js, and useAdminUsers.js.
 *
 * BACKEND COMMUNICATION:
 * - useAdminCouponsList() → admin.service.js#getAdminCoupons(params)
 *   → GET /admin/coupons?page=&limit=&search=&status=&sortBy=&sortOrder=
 * - useCreateCoupon() → coupon.service.js#createCoupon(data) → POST /coupons
 * - useUpdateCoupon() → coupon.service.js#updateCoupon(id, data) → PUT /coupons/:id
 * - useDeleteCoupon() → coupon.service.js#deleteCoupon(id) → DELETE /coupons/:id
 * - useToggleCouponStatus() → coupon.service.js#toggleCouponStatus(id, isActive)
 *   → PATCH /coupons/:id/status
 *
 * WHY THE LIST QUERY READS THE STORE DIRECTLY:
 * Same reasoning as every sibling admin list hook — adminCoupons.store.js
 * is the single source of truth for "what is the admin currently looking
 * at," and every value read from it is included in the queryKey so React
 * Query auto-refetches on any search/filter/sort/page change.
 *
 * MUTATIONS — WHY THEY ALL INVALIDATE THE SAME QUERY KEY PREFIX:
 * create/update/delete/toggle all invalidate `["admin", "coupons"]` rather
 * than one exact page/filter combination — same "invalidate the family,
 * not the exact key" pattern used by every prior admin CRUD hook in this
 * project.
 *
 * PRODUCTION-READY BECAUSE:
 * - Components never see Axios or raw error objects — only
 *   { data, isLoading, isError, mutate, isPending }
 * - `placeholderData: keepPreviousData` avoids a skeleton flash between
 *   page/filter changes
 * - Each mutation resolves/rejects predictably so CouponForm/
 *   DeleteCouponModal can show inline success/error state
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "../services/coupon.service";
import { getAdminCoupons, getAdminCouponById } from "../services/admin.service";
import { useAdminCouponsStore } from "../store/adminCoupons.store";

const COUPONS_QUERY_KEY = ["admin", "coupons"];
const couponDetailKey = (id) => ["admin", "coupons", "detail", id];

/**
 * Fetches the admin coupon list using the current search/filter/sort/page
 * state from adminCoupons.store.js. No params needed.
 */
export const useAdminCouponsList = () => {
  const { search, status, sortBy, sortOrder, page, limit } = useAdminCouponsStore();

  const query = useQuery({
    queryKey: [...COUPONS_QUERY_KEY, { search, status, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const response = await getAdminCoupons({
        search: search || undefined,
        status: status || undefined,
        sortBy,
        sortOrder,
        page,
        limit,
      });
      return response.data.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });

  return {
    coupons: query.data?.coupons ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Fetches a single coupon's full detail — used by EditCouponPage. See
 * admin.service.js's getAdminCouponById for why this admin-only detail
 * read exists (coupons have no customer-facing detail hook to reuse,
 * unlike Products/Categories).
 */
export const useAdminCouponDetail = (couponId) => {
  const query = useQuery({
    queryKey: couponDetailKey(couponId),
    queryFn: async () => {
      const response = await getAdminCouponById(couponId);
      return response.data.data;
    },
    enabled: Boolean(couponId),
    staleTime: 30 * 1000,
  });

  return {
    coupon: query.data?.coupon ?? query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/** Creates a coupon, then invalidates the admin coupons list. */
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
  });
};

/** Updates a coupon, then invalidates both the list and its detail query. */
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: couponDetailKey(id) });
    },
  });
};

/** Deletes a coupon, then invalidates the admin coupons list. */
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
    },
  });
};

/** Flips a coupon's active/inactive status, then invalidates list + detail. */
export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }) => toggleCouponStatus(id, isActive),
    onSuccess: (_res, { id }) => {
      queryClient.invalidateQueries({ queryKey: COUPONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: couponDetailKey(id) });
    },
  });
};