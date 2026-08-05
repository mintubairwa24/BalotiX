/**
 * src/pages/auth/VerifyEmailPage.jsx
 *
 * PURPOSE:
 *   Handles the email verification flow. Unlike the other auth pages,
 *   this one is NOT just composition — it owns the verification logic
 *   directly because the entire page's content depends on a single
 *   async verification result (no separate form needed).
 *
 * FLOW:
 *   1. User clicks the link from their verification email
 *   2. Lands here: /verify-email?token=<uuid>
 *   3. On mount, auto-calls POST /auth/verify-email with the token
 *   4. Shows verifying → success | error state
 *
 * ROUTING:
 *   Registered in src/routes/AppRoutes.jsx as a PUBLIC route (no guard),
 *   since a user clicking this link is not yet authenticated.
 *
 * The token is single-use; revisiting after success still shows success
 * because the backend treats already-verified tokens as valid no-ops.
 */

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { verifyEmail } from "../../services/auth.service";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  const { mutate: verify } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => setStatus("success"),
    onError: () => setStatus("error"),
  });

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verify({ token });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="text-lg font-bold text-gray-900">BalotiX</span>
        </div>

        {status === "verifying" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 size={48} className="text-indigo-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Verifying your email...</h3>
            <p className="text-gray-500 text-sm">This will only take a moment.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"
              >
                <CheckCircle2 size={32} className="text-emerald-600" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Email Verified!</h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                Your account is now active. You can start shopping on BalotiX.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle size={32} className="text-red-500" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Verification Failed</h3>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                {!token
                  ? "This link is missing a verification token."
                  : "This link has expired or has already been used."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                to="/register"
                className="inline-block w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Create a New Account
              </Link>
              <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}