/**
 * src/components/auth/ResetPasswordForm.jsx
 *
 * PURPOSE:
 *   Final step of the password reset flow. The user arrives here via
 *   the link in their reset email: /reset-password?token=<uuid>
 *
 * TOKEN HANDLING:
 *   Token is read from the URL query string (useSearchParams) and sent
 *   in the POST body to /api/auth/reset-password. An invalid/expired
 *   token returns 400/401 from the backend, handled below.
 *
 * BACKEND RULE:
 *   Token is single-use and time-limited (~1 hour). After a successful
 *   reset, it's invalidated server-side.
 *
 * POST-RESET UX:
 *   Show a success state and auto-redirect to /login after 3 seconds.
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, ArrowLeft, KeyRound, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import { resetPasswordSchema } from "../../schemas/auth.schemas";
import { resetPassword } from "../../services/auth.service";
import PasswordField from "../ui/Input/PasswordField";
import PasswordStrength from "./PasswordStrength";
import LoadingButton from "../ui/Button/LoadingButton";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const watchedPassword = watch("password");

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => navigate("/login", { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [isSuccess, navigate]);

  const { mutate: submitReset, isPending } = useMutation({
    mutationFn: ({ password }) => resetPassword({ token, password }),
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("Password updated successfully!");
    },
    onError: (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400 || status === 401) {
        setServerError("This reset link has expired or is invalid. Please request a new one.");
        return;
      }

      setServerError(message || "Something went wrong. Please try again.");
    },
  });

  const onSubmit = (data) => {
    setServerError("");
    submitReset(data);
  };

  if (!token) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle size={32} className="text-red-500" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Invalid Reset Link</h3>
          <p className="mt-2 text-sm text-gray-500">
            This link is missing a reset token. Please use the link from your email.
          </p>
        </div>
        <Link to="/forgot-password" className="inline-block text-sm text-indigo-600 font-semibold hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Password Updated!</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your password has been reset successfully. Redirecting you to sign in...
          </p>
        </div>
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline">
          <ArrowLeft size={14} />
          Go to sign in now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {serverError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
          <Link to="/forgot-password" className="text-xs text-red-600 font-semibold hover:underline pl-7">
            Request a new link →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <PasswordField
            label="New password"
            autoComplete="new-password"
            placeholder="Create your new password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={watchedPassword} />
        </div>

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Re-enter your new password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <LoadingButton type="submit" isLoading={isPending} loadingText="Updating password..." fullWidth>
          <KeyRound size={16} />
          Set New Password
        </LoadingButton>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}