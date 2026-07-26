/**
 * src/components/layout/Footer/Footer.jsx
 *
 * PURPOSE:
 *   Professional footer rendered by CustomerLayout on every shop page.
 *   Four-column grid on desktop, stacked on mobile.
 *   Contains: brand info, quick links, support links, newsletter UI,
 *   social links, and copyright.
 *
 * NEWSLETTER:
 *   UI only — the input and button exist but no API is wired.
 *   Future: POST to a newsletter or user preference endpoint.
 */

import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Camera,
  Share2,
  Users,
  PlayCircle,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import { Logo } from "../../common/Logo/Logo";
import {
  APP,
  FOOTER_QUICK_LINKS,
  FOOTER_SUPPORT_LINKS,
  SOCIAL_LINKS,
} from "../../../constants/app.constants";

const SOCIAL_ICONS = {
  twitter: FaTwitter,
  instagram: FaInstagram,
  facebook: FaFacebookF,
  youtube: FaYoutube,
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 dark:bg-gray-950 text-gray-300">

      {/* ── Main footer grid ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Col 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo size="md" white />

            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              {APP.TAGLINE}. Millions of products, lightning-fast delivery,
              and unbeatable prices.
            </p>

            {/* Contact info */}
            <div className="mt-6 space-y-2.5">
              {[
                { icon: MapPin, text: "Mumbai, Maharashtra, India" },
                { icon: Phone, text: APP.SUPPORT_PHONE },
                { icon: Mail, text: APP.SUPPORT_EMAIL },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{text}</span>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon }) => {
                const Icon = SOCIAL_ICONS[icon];
                return (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {FOOTER_QUICK_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Support */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {FOOTER_SUPPORT_LINKS.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors group"
                  >
                    <ArrowRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Get the best deals and exclusive offers delivered to your inbox.
            </p>

            {/* Newsletter form — UI only */}
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                aria-label="Email for newsletter"
              />
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
              >
                Subscribe
              </button>
            </div>

            <p className="mt-3 text-xs text-gray-600">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {currentYear} {APP.NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}