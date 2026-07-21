import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import { UserListPage } from "./pages/admin/UserListPage";
// Assume other components like HomePage, LoginPage, ProtectedRoute exist

/**
 * A conceptual router setup.
 * This demonstrates how to nest your admin routes within the AdminLayout.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* ... your other public routes like /, /login, /products/:slug */}

      {/* All admin routes are protected and use the AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* The 'index' route is the default page for /admin */}
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<UserListPage />} />
        {/* You can add other admin pages here */}
        {/* <Route path="products" element={<ProductListPage />} /> */}
        {/* <Route path="orders" element={<OrderListPage />} /> */}
      </Route>
    </Routes>
  );
};