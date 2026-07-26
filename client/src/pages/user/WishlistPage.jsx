// src/pages/user/WishlistPage.jsx
//
// WHY THIS FILE EXISTS:
// Pages are thin orchestrators — they compose components and hooks but
// contain no business logic themselves. WishlistPage's job is:
//   1. Call useWishlistQuery to fetch + keep Zustand in sync
//   2. Route to the correct render state (loading / error / empty / data)
//   3. Set the document title for SEO
//
// ROUTE: /wishlist (ProtectedRoute — Customer auth required)
// This page is never reachable by unauthenticated users — ProtectedRoute
// redirects them to /login before this component mounts.
//
// AUTHENTICATION:
// The ProtectedRoute guard handles auth. This page trusts that isAuthenticated
// is true and does NOT re-check. useWishlistQuery also has `enabled: isAuthenticated`
// as a defense-in-depth measure, but the primary guard is at the route level.
//
// HOW IT COMMUNICATES WITH THE BACKEND:
// Entirely through useWishlistQuery, which calls GET /wishlist via
// wishlist.service.js → axios instance. This page has zero direct API knowledge.
//
// FUTURE MODULES:
// Phase 9  — AccountPage, OrdersPage follow the exact same orchestrator pattern
// Phase 10 — CheckoutPage may read wishlist data for cross-sell sidebar

import { useEffect } from "react";
import { motion } from "framer-motion";

import { useWishlistQuery } from "../../hooks/useWishlist";
import { WishlistSummary }  from "../../components/wishlist/WishlistSummary";
import { WishlistGrid }     from "../../components/wishlist/WishlistGrid";
import { WishlistSkeleton } from "../../components/wishlist/WishlistSkeleton";
import { WishlistEmpty }    from "../../components/wishlist/WishlistEmpty";

// ─── Component ───────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const { data: wishlist, isLoading, isError, error } = useWishlistQuery();

  // Document title
  useEffect(() => {
    document.title = "My Wishlist — NexCart";
    return () => {
      document.title = "NexCart";
    };
  }, []);

  // ─── Render states ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page heading — always visible (reads from Zustand, not query data) */}
        <WishlistSummary />

        {/* ── Loading ──────────────────────────────────────────────────── */}
        {isLoading && (
          <WishlistSkeleton count={8} />
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {isError && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Couldn&apos;t load your wishlist
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {error?.response?.data?.message ??
                "Something went wrong. Please refresh the page."}
            </p>
          </motion.div>
        )}

        {/* ── Empty ────────────────────────────────────────────────────── */}
        {!isLoading && !isError && wishlist?.items?.length === 0 && (
          <WishlistEmpty />
        )}

        {/* ── Populated ─────────────────────────────────────────────────── */}
        {!isLoading && !isError && wishlist?.items?.length > 0 && (
          <WishlistGrid items={wishlist.items} />
        )}

      </div>
    </div>
  );
}