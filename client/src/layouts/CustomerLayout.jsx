/**
 * src/layouts/CustomerLayout.jsx
 *
 * PURPOSE:
 *   The shell layout for every customer-facing page:
 *   Homepage, Product Listing, Product Detail, Cart, Checkout, Account, etc.
 *
 *   Structure:
 *   ┌─────────────────────────┐
 *   │        Header           │  sticky
 *   ├─────────────────────────┤
 *   │                         │
 *   │   {children} / Outlet   │  flex-grow, min-h fills viewport
 *   │                         │
 *   ├─────────────────────────┤
 *   │        Footer           │
 *   └─────────────────────────┘
 *
 * WHY A LAYOUT COMPONENT (not just inside each page):
 *   - Header and Footer are rendered once, not remounted on navigation
 *   - MobileMenu state lives here so Header and MobileMenu share it
 *   - ScrollToTop is rendered once here, handling all child page navigations
 *   - All future public pages simply add a route — no wrapper boilerplate
 *
 * USAGE IN APPROUTES.JSX:
 *   { element: <CustomerLayout />, children: [ { path: "/", element: <HomePage /> } ] }
 *   React Router renders children into <Outlet />.
 */

import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../components/layout/Header/Header";
import { Footer } from "../components/layout/Footer/Footer";
import { MobileMenu } from "../components/layout/MobileMenu/MobileMenu";
import { ScrollToTop } from "../components/common/ScrollToTop/ScrollToTop";
import { useModal } from "../hooks/useModel.js";
import { useAuthStore } from "../store/auth.store";
import { useCartStore } from "../store/cart.store";
import { useCartQuery } from "../hooks/useCart";
import { useWishlistQuery } from "../hooks/useWishlist";

export default function CustomerLayout() {
  const { isOpen: isMobileMenuOpen, open: openMenu, close: closeMenu } = useModal();
  const { isAuthenticated } = useAuthStore();
  const { setItemCount } = useCartStore();
  const cartQuery = useCartQuery({ enabled: isAuthenticated });
  useWishlistQuery();

  useEffect(() => {
    if (cartQuery.isSuccess) {
      setItemCount(cartQuery.data?.itemCount ?? 0);
    }
  }, [cartQuery.isSuccess, cartQuery.data, setItemCount]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* Handles scroll-to-top on route change + back-to-top button */}
      <ScrollToTop />

      {/* Sticky Header — passes openMenu to the hamburger button */}
      <Header onMenuOpen={openMenu} />

      {/* Mobile navigation drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMenu} />

      {/* Page content — all child routes render here */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}