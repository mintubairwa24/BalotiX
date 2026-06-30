/**
 * src/components/auth/ForgotPasswordForm.jsx
 *
 * PURPOSE:
 *   Sends a password reset email via POST /api/auth/forgot-password.
 *
 * BACKEND BEHAVIOUR (important for UX):
 *   The backend returns 200 even if the email doesn't exist — this
 *   prevents user enumeration. This means we ALWAYS show the success
 *   state after submission; we never reveal "email not found".
 *
 * RATE LIMITING:
 *   The backend rate-limits this endpoint. On 429, show a descriptive
 *   message instead of the generic success state.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Mail, AlertCircle, ArrowLeft, CheckCircle2, Send } from "lucide-react";

import { forgotPasswordSchema } from "../../schemas/auth.schemas";
import { forgotPassword } from "../../services/auth.service";
import FormField from "../ui/Input/FormField";
import LoadingButton from "../ui/Button/LoadingButton";

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const { mutate: submitForgot, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      setSubmittedEmail(getValues("email"));
      setIsSubmitted(true);
    },
    onError: (error) => {
      const status = error.response?.status;

      if (status === 429) {
        setServerError("Too many reset requests. Please wait a few minutes and try again.");
        return;
      }

      setServerError(error.response?.data?.message || "Something went wrong. Please try again.");
    },
  });

  const onSubmit = (data) => {
    setServerError("");
    submitForgot(data);
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <Send size={28} className="text-indigo-600" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900">Reset link sent!</h3>
          <p className="mt-3 text-gray-500 text-sm leading-relaxed">
            If an account exists for{" "}
            <span className="font-semibold text-gray-700">{submittedEmail}</span>,
            you'll receive a reset link shortly.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-left">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              The link expires in 1 hour. Check your spam folder if you don't see it.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setServerError("");
            }}
            className="text-sm text-indigo-600 hover:underline"
          >
            Didn't receive it? Try again
          </button>

          <Link to="/login" className="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
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
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          hint="Enter the email associated with your NexCart account"
          error={errors.email?.message}
          {...register("email")}
        />

        <LoadingButton type="submit" isLoading={isPending} loadingText="Sending reset link..." fullWidth>
          Send Reset Link
        </LoadingButton>
      </form>

      <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft size={14} />
        Back to sign in
      </Link>
    </div>
  );
}