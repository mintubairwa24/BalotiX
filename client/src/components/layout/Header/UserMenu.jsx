/**
 * src/components/layout/Header/UserMenu.jsx
 *
 * PURPOSE:
 *   Authenticated user avatar with dropdown menu showing account links
 *   and a logout action. Guest users see Login/Register buttons instead
 *   (handled in Header.jsx where this component is conditionally rendered).
 *
 * LOGOUT FLOW:
 *   authService.logout() → backend clears HttpOnly cookies → authStore.clearUser()
 *   → navigate to /login. Runs as a useMutation so it is non-blocking.
 */

import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Package, Heart, Bell, LogOut,
  ChevronDown, Settings,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

import { logout } from "../../../services/auth.service";
import { useAuthStore } from "../../../store/auth.store";
import { useCartStore } from "../../../store/cart.store";
import { useWishlistStore } from "../../../store/wishlist.store";
import { useNotificationStore } from "../../../store/notification.store";
import { useModal } from "../../../hooks/useModel.js";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { ACCOUNT_NAV_LINKS } from "../../../constants/app.constants";

const MENU_ICONS = {
  "/account/profile": User,
  "/account/orders": Package,
  "/account/wishlist": Heart,
  "/account/reviews": Settings,
  "/account/notifications": Bell,
};

export function UserMenu() {
  const { user, clearUser } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const { reset: resetCart } = useCartStore();
  const { reset: resetWishlist } = useWishlistStore();
  const { reset: resetNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const { isOpen, toggle, close } = useModal();
  const menuRef = useRef(null);

  useClickOutside(menuRef, close);

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser();
      resetCart();
      resetWishlist();
      resetNotifications();
      toast.success("Signed out successfully");
      navigate("/login");
    },
    onError: () => {
      // Even if the API call fails, clear client-side state
      clearUser();
      resetCart();
      resetWishlist();
      resetNotifications();
      navigate("/login");
    },
  });

  // Avatar initials from user name
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar trigger */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--app-surface-muted)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="hidden xl:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
          {user?.name?.split(" ")[0]}
        </span>
        <ChevronDown
          size={14}
          className={`hidden xl:block text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-[var(--app-surface-strong)] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border theme-border overflow-hidden z-50"
            role="menu"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b theme-border">
              <p className="text-sm font-semibold theme-text truncate">
                {user?.name}
              </p>
              <p className="text-xs theme-text-muted truncate mt-0.5">
                {user?.email}
              </p>
              {!user?.isVerified && (
                <span className="inline-block mt-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 px-2 py-0.5 rounded-full">
                  Email not verified
                </span>
              )}
            </div>

            {/* Nav links */}
            <div className="py-1">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={close}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950 transition-colors"
                  role="menuitem"
                >
                  <Shield size={15} className="flex-shrink-0" />
                  Admin Dashboard
                </Link>
              )}

              {ACCOUNT_NAV_LINKS.map(({ label, path }) => {
                const Icon = MENU_ICONS[path] || User;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm theme-text-muted hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                    role="menuitem"
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Logout */}
            <div className="border-t theme-border py-1">
              <button
                onClick={() => handleLogout()}
                disabled={isPending}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
                role="menuitem"
              >
                <LogOut size={15} className="flex-shrink-0" />
                {isPending ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
