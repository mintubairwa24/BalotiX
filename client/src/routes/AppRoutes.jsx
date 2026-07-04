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
  // Catch-all 404
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}