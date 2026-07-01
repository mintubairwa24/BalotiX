/**
 * src/components/layout/Header/Header.jsx
 *
 * PURPOSE:
 *   The primary sticky header rendered by CustomerLayout on every
 *   customer-facing page. Orchestrates all header sub-components.
 *
 * LAYOUT (responsive):
 *   Mobile:  [Hamburger] [Logo] ─────── [Search] [Cart]
 *   Tablet:  [Logo] [Nav?] ─── [SearchBar] [Wishlist] [Cart] [User/Login]
 *   Desktop: [Logo] [Navbar] [SearchBar] [Theme] [Wishlist] [Cart] [Notif] [User/Login]
 *
 * STICKY BEHAVIOUR:
 *   Uses useScrollPosition() to add a shadow when scrolled past 10px.
 *   The `top-0 z-40 sticky` classes keep it visible during scroll.
 *
 * GUEST VS AUTHENTICATED:
 *   isAuthenticated from auth.store.js controls which right-side icons
 *   are shown. Guests see Login + Register buttons; customers see the
 *   full icon bar + UserMenu.
 */

import { Link } from "react-router-dom";
import { Menu, LogIn, UserPlus } from "lucide-react";

import { Logo } from "../../common/Logo/Logo";
import { Navbar } from "../Navbar/Navbar";
import { SearchBar } from "../../common/SearchBar/SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { CartIcon } from "./CartIcon";
import { WishlistIcon } from "./WishlistIcon";
import { NotificationIcon } from "./NotificationIcon";
import { UserMenu } from "./UserMenu";
import { useAuthStore } from "../../../store/auth.store";
import { useScrollPosition } from "../../../hooks/useScrollPosition";

export function Header({ onMenuOpen }) {
  const { isAuthenticated } = useAuthStore();
  const { isScrolled } = useScrollPosition();

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full",
        "bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm",
        "transition-shadow duration-200",
        isScrolled
          ? "shadow-md shadow-black/5 dark:shadow-black/20 border-b border-gray-100 dark:border-gray-800"
          : "border-b border-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-3">

          {/* ── Mobile hamburger ─────────────────────────────────── */}
          <button
            onClick={onMenuOpen}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* ── Logo ──────────────────────────────────────────────── */}
          <Logo size="md" />

          {/* ── Desktop navbar ────────────────────────────────────── */}
          <div className="hidden lg:block ml-6">
            <Navbar />
          </div>

          {/* ── Spacer ────────────────────────────────────────────── */}
          <div className="flex-1" />

          {/* ── Search bar ────────────────────────────────────────── */}
          <div className="hidden sm:block w-full max-w-xs lg:max-w-sm xl:max-w-md">
            <SearchBar />
          </div>

          {/* ── Right icons ───────────────────────────────────────── */}
          <div className="flex items-center gap-0.5">

            {/* Theme toggle — always visible */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <WishlistIcon />

                {/* Cart */}
                <CartIcon />

                {/* Notifications */}
                <div className="hidden md:block">
                  <NotificationIcon />
                </div>

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                {/* User menu */}
                <UserMenu />
              </>
            ) : (
              <>
                {/* Cart (guests can still see cart) */}
                <CartIcon />

                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />

                {/* Login / Register */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition-colors"
                  >
                    <LogIn size={15} />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
                  >
                    <UserPlus size={15} />
                    <span>Register</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Mobile search bar (below header row) ──────────────── */}
        <div className="sm:hidden pb-3">
          <SearchBar placeholder="Search products..." />
        </div>
      </div>
    </header>
  );
}