/**
 * src/layouts/AuthLayout.jsx
 *
 * PURPOSE:
 *   Shared two-column layout for all authentication pages
 *   (Login, Register, Forgot Password, Reset Password).
 *     - Left panel: brand identity + value proposition (desktop only)
 *     - Right panel: the form content (children)
 *
 * RESPONSIVE BEHAVIOUR:
 *   - Mobile (< lg): full-width centered form only
 *   - Desktop (>= lg): two columns, left brand panel visible
 *
 * REUSE:
 *   Imported by every page in src/pages/auth/.
 *   Other layouts (CustomerLayout, AdminLayout, DashboardLayout) follow
 *   this same "wraps children, owns chrome" pattern.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Shield, Truck, Star, CreditCard } from "lucide-react";

const FEATURES = [
  { icon: Truck, title: "Free Delivery", description: "On orders above ₹499" },
  { icon: Shield, title: "Secure Payments", description: "Razorpay encrypted checkout" },
  { icon: Star, title: "Top Brands", description: "100,000+ products curated for you" },
  { icon: CreditCard, title: "Easy Returns", description: "7-day hassle-free return policy" },
];

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* ── Left Panel — Brand (desktop only) ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col bg-indigo-600 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500 opacity-40" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-indigo-700 opacity-50" />
        <div className="absolute top-1/2 -right-10 w-48 h-48 rounded-full bg-indigo-400 opacity-30" />

        <div className="relative z-10 flex flex-col h-full px-10 py-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
              <ShoppingBag size={20} className="text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">BalotiX</span>
          </Link>

          <div className="mt-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl xl:text-5xl font-bold text-white leading-tight"
            >
              India's smartest
              <br />
              <span className="text-indigo-200">shopping platform</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-4 text-indigo-200 text-lg leading-relaxed max-w-sm"
            >
              Millions of products. Lightning-fast delivery. Unbeatable prices. All in one place.
            </motion.p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4">
            {FEATURES.map(({ icon: Icon, title: featureTitle, description }, i) => (
              <motion.div
                key={featureTitle}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{featureTitle}</p>
                  <p className="text-indigo-200 text-xs mt-0.5">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-auto text-indigo-300 text-xs">
            © {new Date().getFullYear()}  BalotiX. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel — Form ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
        <div className="lg:hidden mb-8">
          <Link to="/" className="flex items-center gap-2.5 justify-center">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BalotiX</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {(title || subtitle) && (
            <div className="mb-8">
              {title && (
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-2 text-gray-500 text-sm sm:text-base">{subtitle}</p>
              )}
            </div>
          )}

          {children}
        </motion.div>
      </div>
    </div>
  );
}