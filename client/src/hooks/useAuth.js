/**
 * src/hooks/useAuth.js
 *
 * PURPOSE:
 *   Runs once on app mount to determine if the user has an active session
 *   by calling GET /auth/me. The browser sends the HttpOnly accessToken
 *   cookie automatically — there is no localStorage token to read.
 *
 * HOW IT WORKS:
 *   1. On mount, calls authService.getMe()
 *   2. Success → authStore.setUser(user)
 *   3. Failure (401, expired session after refresh attempt, network error)
 *      → authStore.clearUser()
 *
 * INTEGRATION POINT:
 *   Called once in src/App.jsx, before any ProtectedRoute / AdminRoute
 *   is allowed to render its children.
 *
 * REUSE:
 *   This hook is the foundation for persistent login across every module.
 *   Once user is in the store, all protected features read from there.
 */

import { useEffect } from "react";
import { getMe } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";

export function useAuth() {
  const { setUser, clearUser, setLoading } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      setLoading(true);
      try {
        const response = await getMe();
        if (!cancelled && response.data?.success) {
          const user = response.data?.data?.user || response.data?.user;
          if (user) {
            setUser(user);
          } else {
            clearUser();
          }
        } else if (!cancelled) {
          clearUser();
        }
      } catch {
        if (!cancelled) clearUser();
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}