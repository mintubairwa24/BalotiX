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
 * REUSE:
 *   This component is rendered once inside <RouterProvider> in App.jsx.
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoutes";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import HomePage from "../pages/HomePage";

import ErrorPage from "../pages/ErrorPage";

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