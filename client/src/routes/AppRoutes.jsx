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
import HomePage from "../pages/HomePage";


//  Error Pages
import NotFoundPage from "../pages/error/NotFoundPage";
import ServerErrorPage from "../pages/error/ServerErrorPage";
import ErrorPage from "../pages/ErrorPage";
import { Import } from "lucide-react";

const router = createBrowserRouter([
  // ── Guest-only routes ────────────────────────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },

  // ── Public route (no guard) ──────────────────────────────────────────
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },


  
  // ── CustomerLayout shell — all public shop + account pages ───────────
  {
    element: <CustomerLayout />,
    children: [
      // Public shop pages (add here as they are built):
      // { path: "/", element: <HomePage /> },
      // { path: "/products", element: <ProductListingPage /> },
      // { path: "/products/:slug", element: <ProductDetailPage /> },
 
      // Error pages inside CustomerLayout so Header/Footer are present
      { path: "/404", element: <NotFoundPage /> },
      { path: "/500", element: <ServerErrorPage /> },
 
      // Protected customer pages (add here as they are built):
      {
        element: <ProtectedRoute />,
        children: [
          // { path: "/cart", element: <CartPage /> },
          // { path: "/account/profile", element: <ProfilePage /> },
        ],
      },
 
      // Admin pages (add here as they are built):
      {
        element: <AdminRoute />,
        children: [
          // { path: "/admin", element: <DashboardPage /> },
        ],
      },
    ],
  },
 
  // ── 404 wildcard fallback ─────────────────────────────────────────────
  {
    path: "*",
    element: <CustomerLayout />,
    children: [{ index: true, element: <NotFoundPage /> }],
  },


  // ── Protected customer routes ────────────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/", element: <HomePage /> },
    ],
  },


  // ── Public route (no guard) ──────────────────────────────────────────
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },

  // ── Protected customer routes ────────────────────────────────────────
  // Add shop/account pages here as they are built, e.g.:
  // { element: <ProtectedRoute />, children: [{ path: "/cart", element: <CartPage /> }] }
  {
    element: <ProtectedRoute />,
    children: [],
  },

  // ── Admin routes ──────────────────────────────────────────────────────
  // Add admin pages here as they are built, e.g.:
  // { element: <AdminRoute />, children: [{ path: "/admin", element: <DashboardPage /> }] }
  {
    element: <AdminRoute />,
    children: [],
  },

  // ── Fallback ──────────────────────────────────────────────────────────
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}