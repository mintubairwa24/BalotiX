/**
 * src/constants/app.constants.js
 *
 * PURPOSE:
 *   App-wide constant values used across components.
 *   Avoids magic strings and numbers scattered throughout the codebase.
 */

export const APP = {
  NAME: "NexCart",
  TAGLINE: "India's Smartest Shopping Platform",
  SUPPORT_EMAIL: "support@nexcart.in",
  SUPPORT_PHONE: "+91 98765 43210",
};

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Categories", path: "/categories" },
];

export const ACCOUNT_NAV_LINKS = [
  { label: "My Profile", path: "/account/profile" },
  { label: "My Orders", path: "/account/orders" },
  { label: "Wishlist", path: "/account/wishlist" },
  { label: "Reviews", path: "/account/reviews" },
  { label: "Notifications", path: "/account/notifications" },
];

export const FOOTER_QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "Products", path: "/products" },
  { label: "Categories", path: "/categories" },
  { label: "Deals", path: "/products?sale=true" },
];

export const FOOTER_SUPPORT_LINKS = [
  { label: "Help Center", path: "/help" },
  { label: "Track Order", path: "/account/orders" },
  { label: "Returns & Refunds", path: "/returns" },
  { label: "Contact Us", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms of Service", path: "/terms" },
];

export const SOCIAL_LINKS = [
  { label: "Twitter", href: "#", icon: "twitter" },
  { label: "Instagram", href: "#", icon: "instagram" },
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "YouTube", href: "#", icon: "youtube" },
];