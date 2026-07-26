/**
 * src/components/account/AccountLayout/AccountLayout.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Pure structural/layout component shared by all four account pages —
 * sidebar (AccountSidebar, this phase) on the left, page-specific
 * content as `children` on the right. Same composition principle as
 * CheckoutLayout (Phase 12): this component only arranges, it never
 * fetches data or contains business logic.
 * 
 * Rendered once per page (not a persistent app-level layout route)
 * since account pages are a small, self-contained cluster — each page
 * wraps its own content in <AccountLayout> rather than nesting through
 * react-router's layout route mechanism, keeping this phase's routing
 * changes purely additive (new leaf routes) rather than restructuring
 * the existing route tree.
 * 
 * Props:
 * - title: string - page heading shown above the content column
 * - children: page-specific content
 */

import { AccountSidebar } from "../AccountSidebar/AccountSidebar";

export const AccountLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title || "My Account"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <AccountSidebar />
          </div>

          {/* Content */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
};