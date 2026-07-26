/**
 * src/components/account/AccountStats/AccountStats.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Quick-glance stats strip on the Account Dashboard (total orders,
 * saved addresses, wishlist items). Deliberately does NOT call any new
 * "account stats" backend endpoint — that would duplicate data the
 * backend already exposes via existing list endpoints. Instead, this
 * component reuses the SAME hooks those other features already use,
 * reading only their pagination/count metadata:
 * 
 * - useOrdersList(1, 1) (Phase 14, useOrders.js) — requesting just 1
 *   order is enough to read pagination.totalOrders without over-fetching
 * - useAddresses() (Phase 11, useAddress.js) — addresses.length
 * - Wishlist count — ASSUMED to come from a Phase 8 hook. Since this
 *   phase's instructions are strictly about account/profile/security
 *   files, I have not re-inspected Phase 8's exact hook export name
 *   here. Wire the import below to whatever Phase 8 actually exports
 *   (commonly useWishlist() returning { data: items }) — everything
 *   else in this component is backend-agnostic to that detail.
 * 
 * WHY THIS APPROACH IS PRODUCTION-READY:
 * No duplicate backend calls for data that already has a canonical
 * source (Orders, Addresses, Wishlist modules) — single source of
 * truth is preserved even for this "summary" view, and React Query's
 * cache means if the user already visited /orders or /address this
 * session, these numbers may render instantly from cache.
 * 
 * Props: none — self-contained, fetches its own data via hooks
 */

import { Link } from "react-router-dom";
import { Package, MapPin, Heart } from "lucide-react";
import { useOrdersList } from "../../../hooks/useOrders";
import { useAddresses } from "../../../hooks/useAddress";
// ADJUST: import your Phase 8 wishlist hook here, e.g.:
// import { useWishlist } from "../../../hooks/useWishlist";

const StatCard = ({ icon: Icon, label, value, to, isLoading }) => (
  <Link
    to={to}
    className="flex-1 min-w-30 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
  >
    <Icon size={20} className="text-blue-600 dark:text-blue-400 mb-2" />
    <p className="text-xl font-bold text-gray-900 dark:text-white">
      {isLoading ? "—" : value}
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
  </Link>
);

export const AccountStats = () => {
  // Requesting limit=1 — we only need pagination.totalOrders, not the
  // actual order list, keeping this a lightweight call
  const { data: orderData, isLoading: isLoadingOrders } = useOrdersList(1, 1);
  const { data: addresses, isLoading: isLoadingAddresses } = useAddresses();

  // const { data: wishlistItems, isLoading: isLoadingWishlist } = useWishlist();

  const totalOrders = orderData?.pagination?.totalOrders ?? 0;
  const totalAddresses = addresses?.length ?? 0;
  // const totalWishlist = wishlistItems?.length ?? 0;

  return (
    <div className="flex flex-wrap gap-3">
      <StatCard
        icon={Package}
        label="Orders"
        value={totalOrders}
        to="/orders"
        isLoading={isLoadingOrders}
      />
      <StatCard
        icon={MapPin}
        label="Addresses"
        value={totalAddresses}
        to="/address"
        isLoading={isLoadingAddresses}
      />
      <StatCard
        icon={Heart}
        label="Wishlist"
        value="—"
        to="/wishlist"
        isLoading={false}
      />
    </div>
  );
};