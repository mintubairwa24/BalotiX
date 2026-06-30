/**
 * src/pages/auth/ForgotPasswordPage.jsx
 *
 * PURPOSE:
 *   Thin page component — composes AuthLayout + ForgotPasswordForm.
 *
 * ROUTING:
 *   Registered in src/routes/AppRoutes.jsx under <GuestRoute />.
 */

import AuthLayout from "../../layouts/AuthLayout";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout title="Forgot your password?" subtitle="No worries — we'll send you a reset link">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}