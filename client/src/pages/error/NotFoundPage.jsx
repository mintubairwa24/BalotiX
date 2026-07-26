/**
 * src/pages/error/NotFoundPage.jsx
 *
 * PURPOSE:
 *   Professional 404 page. Rendered by the wildcard "*" route in
 *   AppRoutes.jsx. Inside CustomerLayout so the Header and Footer
 *   are visible — user can navigate away easily.
 */

import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFoundPage() {
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
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <Search size={36} className="text-indigo-400" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400 leading-relaxed">
          The page you're looking for doesn't exist or may have been moved.
          Check the URL or head back to the homepage.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
          >
            <Home size={16} />
            Back to Homepage
          </Link>
        </div>

        {/* Popular links */}
        <div className="mt-10">
          <p className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider font-semibold mb-3">
            Popular pages
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Products", to: "/products" },
              { label: "My Orders", to: "/account/orders" },
              { label: "Cart", to: "/cart" },
              { label: "Contact", to: "/contact" },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-1.5 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}