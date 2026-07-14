/**
 * FILE: src/services/admin.service.js
 *
 * ============================================================================
 * src/services/admin.service.js
 * ADMIN SERVICE — Phase 17 Extension (Admin Dashboard Integration)
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Pure Axios layer for admin-only operations. Phase 17 only needs ONE
 * function here — a recent-activity feed for the dashboard overview.
 * Everything else admin-related (Product/Category/User/Order/Coupon CRUD)
 * is explicitly OUT OF SCOPE for this phase and will get its own service
 * functions added here in future phases — this file is designed to grow,
 * not be rewritten.
 *
 * BACKEND CONTRACT (ASSUMED):
 *   GET /admin/activity?limit={n}
 *   Response: {
 *     success: true,
 *     data: {
 *       activities: [
 *         {
 *           _id: string,
 *           type: string,        // e.g. "order" | "payment" | "user" | "review" | "system"
 *                                 // NOTE: this is a DIFFERENT enum from Order status
 *                                 // (pending_payment|confirmed|...) — see RecentActivity.jsx
 *                                 // for why we don't reuse OrderStatusBadge for this.
 *           message: string,     // human-readable, e.g. "New order #1234 placed"
 *           timestamp: string,   // ISO date string
 *           actionUrl: string,   // optional deep link, e.g. "/admin/orders/1234"
 *         }
 *       ]
 *     }
 *   }
 *
 * This endpoint path/shape is NOT verified against a live backend in this
 * environment — flagged here so only ADMIN_ENDPOINTS.RECENT_ACTIVITY needs
 * to change if the real contract differs.
 *
 * PRODUCTION-READY BECAUSE:
 * - `limit` is a query param, not hardcoded — dropdown-preview vs full-page
 *   uses (mirrors the Phase 16 Notifications pattern: same fetcher, two
 *   different page/limit combinations) can both call this function.
 * - Returns the full Axios response for consistency with every other
 *   service file in the project.
 */

import api from "../api/axios";

const ADMIN_ENDPOINTS = {
  RECENT_ACTIVITY: "/admin/activity",
};

/**
 * Fetch recent admin-relevant activity (orders, payments, signups, etc.)
 * for the dashboard's RecentActivity feed.
 *
 * @param {number} limit - max number of activity items to fetch (default 10)
 * @returns {Promise<AxiosResponse>} full axios response; caller extracts
 *          response.data.data.activities in the hooks layer.
 */
export const getRecentActivity = (limit = 10) => {
  return api.get(ADMIN_ENDPOINTS.RECENT_ACTIVITY, {
    params: { limit },
  });
};

// NOTE: Future phases (Product/Category/User/Order/Coupon CRUD, Phase 18+)
// will add their functions below this line, keeping this file the single
// home for all admin-only Axios calls — consistent with how cart.service.js,
// order.service.js etc. each own their entire feature's API surface.
