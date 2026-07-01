/**
 * src/pages/error/ServerErrorPage.jsx
 *
 * PURPOSE:
 *   Professional 500 error page. Displayed when the backend returns an
 *   unexpected 5xx error or when React error boundaries catch a render
 *   crash (future: integrate with ErrorBoundary component).
 *
 * WHEN TO SHOW:
 *   Navigate to /500 programmatically in the Axios error interceptor
 *   when status === 500, or from a React ErrorBoundary fallback.
 */

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

export default function ServerErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-280px)] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Illustration */}
        <div className="relative inline-block mb-8">
          <div className="text-[120px] font-black text-gray-100 dark:text-gray-800 leading-none select-none">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center">
              <AlertTriangle size={36} className="text-red-400" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400 leading-relaxed">
          Our servers are experiencing an issue. This is not your fault —
          our team has been notified and is working on a fix.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(0)} // hard refresh
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            <Home size={16} />
            Back to Homepage
          </Link>
        </div>

        {/* Status info */}
        <div className="mt-10 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If this keeps happening, contact us at{" "}
            <a
              href="mailto:support@nexcart.in"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              support@nexcart.in
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}