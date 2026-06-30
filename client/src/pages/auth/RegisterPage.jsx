/**
 * src/pages/auth/RegisterPage.jsx
 *
 * PURPOSE:
 *   Thin page component — composes AuthLayout + RegisterForm.
 *
 * ROUTING:
 *   Registered in src/routes/AppRoutes.jsx under <GuestRoute />.
 */

import AuthLayout from "../../layouts/AuthLayout";
import RegisterForm from "../../components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Join millions of smart shoppers on NexCart">
      <RegisterForm />
    </AuthLayout>
  );
}