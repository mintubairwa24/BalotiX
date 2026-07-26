/**
 * src/pages/auth/LoginPage.jsx
 *
 * PURPOSE:
 *   Thin page component — composes AuthLayout + LoginForm.
 *   Contains no business logic; all behavior lives in LoginForm and
 *   the auth service/store layers.
 *
 * ROUTING:
 *   Registered in src/routes/AppRoutes.jsx under <GuestRoute />, which
 *   redirects already-authenticated users away from this page.
 */

import AuthLayout from "../../layouts/AuthLayout";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your BalotiX account">
      <LoginForm />
    </AuthLayout>
  );
}