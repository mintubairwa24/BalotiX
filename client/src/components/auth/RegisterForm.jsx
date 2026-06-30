/**
 * src/components/auth/RegisterForm.jsx
 *
 * PURPOSE:
 *   Handles new customer registration via POST /api/auth/register.
 *
 * IMPORTANT BACKEND RULES:
 *   1. `role` is never sent from this form — the backend always creates
 *      customers regardless of what's submitted.
 *   2. Registration does NOT auto-login. The backend sends a verification
 *      email first; the success state below reflects that.
 *
 * POST-REGISTER UX:
 *   On success, shows an inline confirmation state (not a redirect) so
 *   the user understands why login won't work until they verify.
 *
 * PASSWORD STRENGTH:
 *   PasswordStrength (components/auth/) watches the live password value
 *   via React Hook Form's watch() for real-time feedback.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Mail, User, AlertCircle, CheckCircle2, Mail as MailIcon } from "lucide-react";

import { registerSchema } from "../../schemas/auth.schemas";
import { register as registerUser } from "../../services/auth.service";
import FormField from "../ui/Input/FormField";
import PasswordField from "../ui/Input/PasswordField";
import PasswordStrength from "./PasswordStrength";
import LoadingButton from "../ui/Button/LoadingButton";

export default function RegisterForm() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const watchedPassword = watch("password");

  const { mutate: submitRegister, isPending } = useMutation({
    mutationFn: (data) => {
      const { confirmPassword, ...payload } = data;
      return registerUser(payload);
    },
    onSuccess: (_, variables) => {
      setRegisteredEmail(variables.email);
      setIsRegistered(true);
    },
    onError: (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 409) {
        setServerError("An account with this email already exists. Try logging in instead.");
        return;
      }

      if (status === 400 && error.response?.data?.errors) {
        const firstError = error.response.data.errors[0];
        setServerError(firstError?.message || message);
        return;
      }

      setServerError(message || "Registration failed. Please try again.");
    },
  });

  const onSubmit = (data) => {
    setServerError("");
    submitRegister(data);
  };

  if (isRegistered) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900">Almost there! Check your email</h3>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-semibold text-gray-700">{registeredEmail}</span>.
            Click the link to activate your account.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left">
          <div className="flex items-start gap-2.5">
            <MailIcon size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              Don't see it? Check your spam folder or wait a minute before requesting another.
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Already verified?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {serverError && (
        <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Ravi Kumar"
          icon={User}
          error={errors.name?.message}
          {...register("name")}
        />

        <FormField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register("email")}
        />

        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={watchedPassword} />
        </div>

        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <p className="text-xs text-gray-500 leading-relaxed">
          By creating an account, you agree to NexCart's{" "}
          <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
        </p>

        <LoadingButton type="submit" isLoading={isPending} loadingText="Creating your account..." fullWidth>
          Create Account
        </LoadingButton>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}