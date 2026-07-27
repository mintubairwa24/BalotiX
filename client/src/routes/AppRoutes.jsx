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
import HomePage from "../pages/HomePage"; // phase 4

// ── Phase 5 ───────────────────────────────────────────────────────────────────
import ProductListingPage from "../pages/shop/ProductListingPage";
import ProductDetailsPage from "../pages/shop/ProductDetailsPage";

// ── Phase 6 ───────────────────────────────────────────────────────────────────
import CategoriesPage from "../pages/shop/CategoriesPage";
import CategoryPage from "../pages/shop/CategoryPage";

// ── Phase 7 ───────────────────────────────────────────────────────────────────
import SearchResultsPage from "../pages/shop/SearchResultsPage";

// ── Phase 8 ───────────────────────────────────────────────────────────────────
import WishlistPage from "../pages/user/WishlistPage";

// ── Phase 9 ───────────────────────────────────────────────────────────────────
import { CartPage } from "../pages/checkout/CartPage";

// ── Phase 10 ───────────────────────────────────────────────────────────────────
// import {  } ;

// ── Phase 11 ───────────────────────────────────────────────────────────────────
import { AddressBookPage } from "../pages/user/AddressBookPage";

// ── Phase 12 ───────────────────────────────────────────────────────────────────
import { CheckoutPage } from "../pages/checkout/CheckoutPage";

// ── Phase 13 ───────────────────────────────────────────────────────────────────
import { PaymentPage } from "../components/payment/PaymentPage";
import { PaymentSuccessPage } from "../components/payment/PaymentSuccessPage";
import { PaymentFailedPage } from "../components/payment/PaymentFailedPage";

// ── Phase 14 ───────────────────────────────────────────────────────────────────
import { OrdersPage } from "../pages/orders/OrdersPage";
import { OrderDetailsPage } from "../pages/orders/OrderDetailsPage";

// ── Phase 15 ───────────────────────────────────────────────────────────────────
import { AccountDashboardPage } from "../pages/account/AccountDashboardPage";
import { ProfilePage } from "../pages/account/ProfilePage";
import { EditProfilePage } from "../pages/account/EditProfilePage";
import { SecurityPage } from "../pages/account/SecurityPage";


// ── Phase 16 ───────────────────────────────────────────────────────────────────
import { NotificationsPage } from "../pages/notifications/NotificationsPage";

// ── Phase 17 ───────────────────────────────────────────────────────────────────
import { AdminLayout } from "../components/admin/AdminLayout/AdminLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";

// ── Phase 18 ───────────────────────────────────────────────────────────────────
import ProductsPage from "../pages/admin/products/ProductsPage";
import CreateProductPage from "../pages/admin/products/CreateProductPage";
import EditProductPage from "../pages/admin/products/EditProductPage";

// ── Phase 18A ───────────────────────────────────────────────────────────────────
import CategoriesAdminPage from "../pages/admin/categories/CategoriesPage";
import CreateCategoryPage from "../pages/admin/categories/CreateCategoryPage";
import EditCategoryPage from "../pages/admin/categories/EditCategoryPage";

// ── Phase 18B ───────────────────────────────────────────────────────────────────

import UsersPage from "../pages/admin/users/UsersPage";
import UserDetailsPage from "../pages/admin/users/UserDetailsPage";
import EditUserPage from "../pages/admin/users/EditUserPage";

// ── Phase 18C ───────────────────────────────────────────────────────────────────



// ── Phase 18D ───────────────────────────────────────────────────────────────────
import CouponsPage from "../pages/admin/coupons/CouponsPage";
import CreateCouponPage from "../pages/admin/coupons/CreateCouponPage";
import EditCouponPage from "../pages/admin/coupons/EditCouponPage";


// ── Phase 18F ───────────────────────────────────────────────────────────────────
import InventoryPage from "../pages/admin/inventory/InventoryPage";
import InventoryDetailsPage from "../pages/admin/inventory/InventoryDetailsPage";
import ReviewsPage from "../pages/admin/reviews/ReviewsPage";
import ReviewDetailsPage from "../pages/admin/reviews/ReviewDetailsPage";

// ── Phase 18H ───────────────────────────────────────────────────────────────────
import SalesReportPage from "../pages/admin/analytics/SalesReportPage";
import AnalyticsDashboard from "../pages/admin/analytics/AnalyticsDashboard";



// Error Pages
import NotFoundPage from "../pages/error/NotFoundPage";
import ServerErrorPage from "../pages/error/ServerErrorPage";
import ErrorPage from "../pages/ErrorPage";
import { CheckoutSuccessRedirect } from "../pages/checkout/CheckoutSuccessRedirect";

const router = createBrowserRouter([
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
      { index: true, element: <HomePage /> },
      { path: "/products", element: <ProductListingPage /> }, // Phase 5
      { path: "/products/:slug", element: <ProductDetailsPage /> }, // Phase 5
      { path: "/categories", element: <CategoriesPage /> },
      { path: "/category/:slug", element: <CategoryPage /> },
      { path: "/search", element: <SearchResultsPage /> },

      // Error pages (inside CustomerLayout so Header/Footer render)
      { path: "/404", element: <NotFoundPage /> },
      { path: "/500", element: <ServerErrorPage /> },

      // ── Protected customer pages ───────────────────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          // Phase 7:
          // { path: "/account/profile",  element: <ProfilePage /> },
          // { path: "/account/orders",   element: <OrdersPage /> },
          { path: "/cart", element: <CartPage /> },
          { path: "/account/wishlist", element: <WishlistPage /> },
          { path: "address", element: <AddressBookPage /> },
          { path: "/checkout", element: <CheckoutPage /> },
          {
            path: "checkout/success/:orderId",
            element: <CheckoutSuccessRedirect />,
          },
          { path: "payment/:orderId", element: <PaymentPage /> }, // Phase 13 NEW
          { path: "payment/success/:orderId", element: <PaymentSuccessPage /> }, // Phase 13 NEW
          { path: "payment/failed/:orderId", element: <PaymentFailedPage /> }, // Phase 13 NEW
          { path: "orders", element: <OrdersPage /> }, // Phase 14 NEW
          { path: "orders/:orderId", element: <OrderDetailsPage /> }, // Phase 14 NEW

          { path: "account", element: <AccountDashboardPage /> },
          { path: "account/profile", element: <ProfilePage /> },
          { path: "account/edit", element: <EditProfilePage /> },
          { path: "account/security", element: <SecurityPage /> },
          { path: "account/notifications", element: <NotificationsPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "wishlist", element: <WishlistPage /> },
        ],
      },

      // ── Admin pages ────────────────────────────────────────────────────────
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: "/admin", element: <AdminDashboardPage /> },

               {/* Phase 18A — Product Management */},
              { path: "/admin/products",  element: <ProductsPage /> },
              { path: "/admin/products/create", element: <CreateProductPage />},
              { path: "/admin/products/:id/edit", element: <EditProductPage />},

               {/* Phase 18B/18D — Category Management */},
              { path: "/admin/categories", element: <CategoriesAdminPage />},
              { path: "/admin/categories/create", element: <CreateCategoryPage />},
              { path: "/admin/categories/:id/edit", element: <EditCategoryPage />},
              
              {/* Phase 18C — User Management */},
              { path: "/admin/users", element: <UsersPage />},
              { path: "/admin/users/:id", element: <UserDetailsPage />},
              { path: "/admin/users/:id/edit", element: <EditUserPage />},
              

              {/* Phase 18E — Coupon Management */},
              { path: "/admin/coupons", element: <CouponsPage />},
              { path: "/admin/coupons/create", element: <CreateCouponPage />},
              { path: "/admin/coupons/:id/edit", element: <EditCouponPage />},
              { path: "/admin/coupons/:id/edit", element: <EditCouponPage />},
              
              {/* Phase 18F — Inventory Management */},
              { path: "/admin/inventory", element: <InventoryPage />},
              { path: "/admin/inventory/:productId", element: <InventoryDetailsPage />},
              { path: "/admin/reviews", element: <ReviewsPage />},
              { path: "/admin/reviews/:id", element: <ReviewDetailsPage />},
              
              {/* Phase 18H Analytics and Reports */},
              { path: "/admin/analytics", element: <AnalyticsDashboard />},
              { path: "/admin/analytics/sales", element: <SalesReportPage />},

            ],
          },
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
