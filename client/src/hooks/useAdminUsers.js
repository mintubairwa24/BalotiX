/**
 * FILE: src/hooks/useAdminUsers.js
 *
 * ============================================================================
 * useAdminUsers — Phase 18C (Admin User Management)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The React Query boundary between the pure-Axios service files
 * (admin.service.js, user.service.js) and the Users UI. Owns cache keys,
 * response unwrapping, and — for the list query — derives its params
 * straight from adminUsers.store.js, exact sibling of useAdminProducts.js
 * and useAdminCategories.js.
 *
 * BACKEND COMMUNICATION:
 * - useAdminUsersList() → admin.service.js#getAdminUsers(params)
 *   → GET /admin/users?page=&limit=&search=&status=&role=&verified=&sortBy=&sortOrder=
 * - useAdminUserDetail(id) → admin.service.js#getAdminUserById(id)
 *   → GET /admin/users/:id
 * - useUpdateUserByAdmin() → user.service.js#updateUserByAdmin(id, data) → PUT /users/:id
 * - useSetUserStatus() → user.service.js#setUserStatus(id, status) → PATCH /users/:id/status
 *   (powers BOTH SuspendUserModal and ActivateUserModal — same endpoint,
 *   opposite `status` values, so one mutation hook covers both rather than
 *   two near-identical ones)
 * - useDeleteUser() → user.service.js#deleteUser(id) → DELETE /users/:id
 * - useRestoreUser() → user.service.js#restoreUser(id) → PATCH /users/:id/restore
 * - useChangeUserRole() → user.service.js#changeUserRole(id, role) → PATCH /users/:id/role
 *
 * WHY THE LIST QUERY READS THE STORE DIRECTLY:
 * Same reasoning as useAdminProductsList/useAdminCategoriesList —
 * adminUsers.store.js is the single source of truth for "what is the
 * admin currently looking at," and every value read from it is included
 * in the queryKey so React Query auto-refetches on any change.
 *
 * WHY useAdminUserDetail IS A SEPARATE, ID-KEYED QUERY (not derived from
 * the list cache): the detail response bundles addresses/orderSummary/
 * activity that the list response deliberately does NOT include (a table
 * row doesn't need a user's full order history) — this is a genuinely
 * different shape, not just "the same user object, more of it," so it's
 * its own query rather than a client-side lookup into the list cache.
 *
 * MUTATIONS — INVALIDATION STRATEGY:
 * Every mutation invalidates BOTH `["admin", "users"]` (the list, at any
 * page/filter combination) AND, when a specific user id is available,
 * `["admin", "users", "detail", id]` — so a status/role change made from
 * UserDetailsPage is immediately reflected back in UsersTable and vice
 * versa, without either screen needing to know about the other.
 *
 * PRODUCTION-READY BECAUSE:
 * - Components never see Axios or raw error objects — only
 *   { data, isLoading, isError, mutate, isPending }
 * - `placeholderData: keepPreviousData` avoids a skeleton flash between
 *   page/filter changes on the list
 * - Detail query is disabled (`enabled: Boolean(userId)`) until a real id
 *   is available, avoiding a wasted request on initial render
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  updateUserByAdmin,
  setUserStatus,
  deleteUser,
  restoreUser,
  changeUserRole,
} from "../services/user.service";
import { getAdminUsers, getAdminUserById } from "../services/admin.service";
import { useAdminUsersStore } from "../store/adminUsers.store";

const USERS_QUERY_KEY = ["admin", "users"];
const userDetailKey = (id) => ["admin", "users", "detail", id];

/**
 * Fetches the admin user list using the current search/filter/sort/page
 * state from adminUsers.store.js. No params needed.
 */
export const useAdminUsersList = () => {
  const { search, status, role, verified, sortBy, sortOrder, page, limit } =
    useAdminUsersStore();

  const query = useQuery({
    queryKey: [...USERS_QUERY_KEY, { search, status, role, verified, sortBy, sortOrder, page, limit }],
    queryFn: async () => {
      const response = await getAdminUsers({
        search: search || undefined,
        status: status || undefined,
        role: role || undefined,
        verified: verified || undefined,
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
    users: query.data?.users ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

/** Fetches full admin detail for one user — profile + addresses + orders + activity. */
export const useAdminUserDetail = (userId) => {
  const query = useQuery({
    queryKey: userDetailKey(userId),
    queryFn: async () => {
      const response = await getAdminUserById(userId);
      return response.data.data;
    },
    enabled: Boolean(userId),
    staleTime: 30 * 1000,
  });

  return {
    user: query.data?.user,
    addresses: query.data?.addresses ?? [],
    orderSummary: query.data?.orderSummary,
    activity: query.data?.activity ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

const invalidateUserQueries = (queryClient, userId) => {
  queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
  if (userId) {
    queryClient.invalidateQueries({ queryKey: userDetailKey(userId) });
  }
};

/** Updates the admin-editable fields (name, phone) on a user's account. */
export const useUpdateUserByAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUserByAdmin(id, data),
    onSuccess: (_res, { id }) => invalidateUserQueries(queryClient, id),
  });
};

/** Sets a user's status — powers both SuspendUserModal and ActivateUserModal. */
export const useSetUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => setUserStatus(id, status),
    onSuccess: (_res, { id }) => invalidateUserQueries(queryClient, id),
  });
};

/** Soft-deletes a user's account — see user.service.js for the flagged assumption. */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (_res, id) => invalidateUserQueries(queryClient, id),
  });
};

/** Restores a soft-deleted user's account. */
export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => restoreUser(id),
    onSuccess: (_res, id) => invalidateUserQueries(queryClient, id),
  });
};

/** Changes a user's role — see user.service.js for the flagged assumption. */
export const useChangeUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => changeUserRole(id, role),
    onSuccess: (_res, { id }) => invalidateUserQueries(queryClient, id),
  });
};