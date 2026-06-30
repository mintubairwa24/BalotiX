/**
 * src/components/auth/LoginForm.jsx
 *
 * PURPOSE:
 *   Handles user login via POST /api/auth/login. On success, the backend
 *   sets HttpOnly accessToken + refreshToken cookies. The user object
 *   from the response is stored in auth.store.js.
 *
 * FORM STACK:
 *   React Hook Form (state/validation trigger) + Zod (schema, via
 *   loginSchema from src/schemas/auth.schemas.js).
 *
 * POST-LOGIN ROUTING:
 *   - role "admin"   → /admin
 *   - role "customer"→ location.state.from (page they tried to visit)
 *                       or / as fallback
 *
 * ERROR HANDLING:
 *   - Field errors: caught client-side by Zod before submission
 *   - 401 (wrong credentials): shown as inline form error
 *   - 429 (rate limited): shown as a toast
 *
 * SECURITY:
 *   No token handling here — tokens live in HttpOnly cookies managed
 *   by the backend and sent automatically via the shared Axios instance.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Mail, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import { loginSchema } from "../../schemas/auth.schemas";
import { login } from "../../services/auth.service";
import { useAuthStore } from "../../store/auth.store";
import FormField from "../ui/Input/FormField";
import PasswordField from "../ui/Input/PasswordField";
import LoadingButton from "../ui/Button/LoadingButton";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { mutate: submitLogin, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      const user = response.data?.data?.user || response.data?.user;
      if (!user) {
        setServerError("Something went wrong. Please try again.");
        return;
      }

      setUser(user);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);

      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    },
    onError: (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 429) {
        toast.error("Too many login attempts. Please try again in a few minutes.");
        return;
      }

      setServerError(message || "Something went wrong. Please try again.");
    },
  });

  const onSubmit = (data) => {
    setServerError("");
    submitLogin(data);
  };

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
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-1">
          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <LoadingButton type="submit" isLoading={isPending} loadingText="Signing in..." fullWidth className="mt-2">
          Sign In
        </LoadingButton>
      </form>

      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
          Create one for free
        </Link>
      </p>
    </div>
  );
}