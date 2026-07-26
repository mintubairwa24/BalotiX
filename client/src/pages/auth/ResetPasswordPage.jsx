/**
 * src/pages/auth/ResetPasswordPage.jsx
 *
 * PURPOSE:
 *   Thin page component — composes AuthLayout + ResetPasswordForm.
 *   The reset token is read inside ResetPasswordForm via useSearchParams,
 *   not here — keeps this page purely compositional.
 *
 * ROUTING:
 *   Registered in src/routes/AppRoutes.jsx under <GuestRoute />.
 *   Accessed via the link in the password reset email:
 *   /reset-password?token=<uuid>
 */

import AuthLayout from "../../layouts/AuthLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Set a new password" subtitle="Your new password must be at least 8 characters">
      <ResetPasswordForm />
    </AuthLayout>
  );
}