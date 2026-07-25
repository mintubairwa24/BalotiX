/**
 * src/components/layout/MobileMenu/MobileMenu.jsx
 *
 * PURPOSE:
 *   Slide-in navigation drawer for mobile and tablet (< lg breakpoint).
 *   Contains all navigation that is hidden from the Header on small screens:
 *   - Main nav links
 *   - Account links (if authenticated)
 *   - Login/Register (if guest)
 *   - Theme toggle
 *
 * WHY NOT RENDER TWICE:
 *   We use a single MobileMenu component triggered by the hamburger in the
 *   Header. The Navbar component (desktop only) is hidden on mobile via
 *   `hidden lg:flex` — there's no duplication of nav logic.
 *
 * ACCESSIBILITY:
 *   - Overlay traps focus to the drawer when open (future: add focus trap)
 *   - ESC key closes the drawer
 *   - aria-modal + role="dialog" for screen readers
 */

import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, Package, Grid3x3, LogIn, UserPlus,
  User, ShoppingBag, Heart, Bell, LogOut, Settings, Shield,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Logo } from "../../common/Logo/Logo";
import { ThemeToggle } from "../../common/ThemeToggle/ThemeToggle";
import { useAuthStore } from "../../../store/auth.store";
import { useCartStore } from "../../../store/cart.store";
import { useWishlistStore } from "../../../store/wishlist.store";
import { useNotificationStore } from "../../../store/notification.store";
import { logout } from "../../../services/auth.service";

const NAV_ITEMS = [
  { label: "Home", path: "/", icon: Home },
  { label: "Products", path: "/products", icon: Package },
  { label: "Categories", path: "/categories", icon: Grid3x3 },
];

const ACCOUNT_ITEMS = [
  { label: "My Profile", path: "/account/profile", icon: User },
  { label: "My Orders", path: "/account/orders", icon: ShoppingBag },
  { label: "Wishlist", path: "/account/wishlist", icon: Heart },
  { label: "Notifications", path: "/account/notifications", icon: Bell },
  { label: "Settings", path: "/account/settings", icon: Settings },
];

export function MobileMenu({ isOpen, onClose }) {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const { reset: resetCart } = useCartStore();
  const { reset: resetWishlist } = useWishlistStore();
  const { reset: resetNotifications } = useNotificationStore();
  const navigate = useNavigate();

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const { mutate: handleLogout, isPending } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser(); resetCart(); resetWishlist(); resetNotifications();
      toast.success("Signed out successfully");
      onClose();
      navigate("/login");
    },
    onError: () => {
      clearUser(); resetCart(); resetWishlist(); resetNotifications();
      onClose();
      navigate("/login");
    },
  });

  const linkClass = ({ isActive }) =>
    [
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
      isActive
        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950"
        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
    ].join(" ");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[300px] bg-[var(--app-surface-strong)] shadow-2xl lg:hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b theme-border">
              <Logo size="sm" />
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center theme-text-muted hover:text-[var(--app-fg)] hover:bg-[var(--app-surface-muted)] transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">

              {/* Authenticated user info */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-indigo-50 dark:bg-indigo-950 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold theme-text truncate">
                      {user.name}
                    </p>
                    <p className="text-xs theme-text-muted truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Main navigation */}
              <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider px-4 mb-1">
                Shop
              </p>
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                <NavLink key={path} to={path} end={path === "/"} onClick={onClose} className={linkClass}>
                  <Icon size={18} className="flex-shrink-0" />
                  {label}
                </NavLink>
              ))}

              {/* Account navigation — authenticated only */}
              {isAuthenticated && (
                <>
                  {user?.role === "admin" && (
                    <NavLink
                      to="/admin"
                      onClick={onClose}
                      className="mb-3 flex items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      <Shield size={18} className="flex-shrink-0" />
                      Admin Dashboard
                    </NavLink>
                  )}

                  <div className="my-3 border-t theme-border" />
                  <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider px-4 mb-1">
                    My Account
                  </p>
                  {ACCOUNT_ITEMS.map(({ label, path, icon: Icon }) => (
                    <NavLink key={path} to={path} onClick={onClose} className={linkClass}>
                      <Icon size={18} className="flex-shrink-0" />
                      {label}
                    </NavLink>
                  ))}
                </>
              )}
            </div>

            {/* Footer — login/logout */}
            <div className="border-t theme-border p-4">
              {isAuthenticated ? (
                <button
                  onClick={() => handleLogout()}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border border-red-200 dark:border-red-900 transition-colors disabled:opacity-50"
                >
                  <LogOut size={16} />
                  {isPending ? "Signing out..." : "Sign Out"}
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                  >
                    <LogIn size={16} />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    <UserPlus size={16} />
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
