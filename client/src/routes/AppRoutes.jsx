/**
 * src/routes/AppRoutes.jsx
 *
 * PURPOSE:
 *   Defines every application route and applies the correct guard
 *   (GuestRoute / ProtectedRoute / AdminRoute) per route group.
 *
 * TODAY'S SCOPE:
 *   Only the Authentication module's routes are wired up:
 *     /login, /register, /forgot-password, /reset-password (GuestRoute)
 *     /verify-email (public, no guard)
 *
 * FUTURE SCOPE:
 *   As shop, account, and admin pages are built, add them as children
 *   under the existing <ProtectedRoute /> and <AdminRoute /> groups
 *   below — the guard wiring is already in place.
 * 
 * HOW TO ADD A NEW PAGE:
 *   Add a child route under the CustomerLayout group:
 *   { path: "/products", element: <ProductListingPage /> }
 *   That's it — Header + Footer come for free.
 *
 * REUSE:
 *   This component is rendered once inside <RouterProvider> in App.jsx.
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import CustomerLayout from "../layouts/CustomerLayout";
import ProtectedRoute from "./ProtectedRoutes";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import HomePage from "../pages/HomePage";  // phase 4 

// ── Phase 5 ───────────────────────────────────────────────────────────────────
import ProductListingPage from "../pages/shop/ProductListingPage";
import ProductDetailsPage from "../pages/shop/ProductDetailsPage";
 

// Error Pages
import NotFoundPage from "../pages/error/NotFoundPage";
import ServerErrorPage from "../pages/error/ServerErrorPage";
import ErrorPage from "../pages/ErrorPage";

const router = createBrowserRouter([
  // Home page — publicly accessible, shown first
  {
    path: "/",
    element: <CustomerLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/404", element: <NotFoundPage /> },
      { path: "/500", element: <ServerErrorPage /> },
      {
        element: <ProtectedRoute />,
        children: [{ path: "/protected-home", element: <HomePage /> }],
      },
      {
        element: <AdminRoute />,
        children: [],
      },
    ],
  },
  // Guest-only routes (login, register, etc.)
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/admin/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  // Email verification (public)
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },

{
    element: <CustomerLayout />,
    children: [
 
      // ── Public shop pages ──────────────────────────────────────────────────
      { path: "/",               element: <HomePage /> },
      { path: "/products",       element: <ProductListingPage /> },   // Phase 5
      { path: "/products/:slug", element: <ProductDetailsPage /> },   // Phase 5
 
      // Future Phase 6 pages (uncomment as built):
      // { path: "/category/:slug", element: <CategoryPage /> },
      // { path: "/search",         element: <SearchPage /> },
 
      // Error pages (inside CustomerLayout so Header/Footer render)
      { path: "/404", element: <NotFoundPage /> },
      { path: "/500", element: <ServerErrorPage /> },
 
      // ── Protected customer pages ───────────────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          // Phase 7:
          // { path: "/cart",             element: <CartPage /> },
          // { path: "/checkout",         element: <CheckoutPage /> },
          // { path: "/account/profile",  element: <ProfilePage /> },
          // { path: "/account/orders",   element: <OrdersPage /> },
          // { path: "/account/wishlist", element: <WishlistPage /> },
        ],
      },
 
      // ── Admin pages ────────────────────────────────────────────────────────
      {
        element: <AdminRoute />,
        children: [
          // Phase 8:
          // { path: "/admin",           element: <DashboardPage /> },
          // { path: "/admin/products",  element: <AdminProductsPage /> },
        ],
      },
    ],
  },
  
  // Catch-all 404
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}