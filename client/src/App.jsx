/**
 * src/App.jsx
 *
 * PURPOSE:
 *   Composes the application from its foundational layers:
 *     1. React Query provider — server state cache
 *     2. useAuth() — session check via GET /auth/me on mount
 *     3. AppRoutes — routing with guards
 *     4. Toaster — global toast notifications
 *
 * ORDER MATTERS:
 *   useAuth() must run before any ProtectedRoute/AdminRoute renders.
 *   isLoading in auth.store.js ensures guards show a spinner instead of
 *   redirecting to /login while the session check is in flight.
 *
 * REUSE:
 *   This file should rarely change as new modules are added — new
 *   routes go into AppRoutes.jsx, new global providers (e.g. a future
 *   Socket.IO context) wrap <AppRoutes /> here.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { useAuth } from "./hooks/useAuth.js";
import AppRoutes from "./routes/AppRoutes.jsx";

// Registers Axios request/response interceptors as a side effect
import "./api/interceptors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInner() {
  useAuth();
  return <AppRoutes />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />

      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
    </QueryClientProvider>
  );
}