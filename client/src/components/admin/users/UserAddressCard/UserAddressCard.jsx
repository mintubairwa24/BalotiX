/**
 * FILE: src/components/admin/users/UserAddressCard/UserAddressCard.jsx
 *
 * ============================================================================
 * UserAddressCard — Phase 18C
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * Renders one user's saved address, read-only, for the admin's "View
 * addresses" requirement. Data comes from the `addresses` array bundled in
 * useAdminUserDetail()'s response (GET /admin/users/:id — see
 * admin.service.js).
 *
 * WHY NOT REUSE THE CUSTOMER-FACING AddressCard DIRECTLY (Phase 11):
 * The customer AddressCard is almost certainly interactive — Edit/Delete/
 * "Set as default" buttons acting on the LOGGED-IN user's own addresses.
 * An admin viewing ANOTHER person's addresses has no such actions
 * available (nothing in this phase's brief or file list adds address
 * mutation for admins), so reusing that component as-is would either show
 * dead buttons or require passing a bunch of "hide the buttons" props into
 * a component that wasn't designed for a read-only mode. A small, purely
 * read-only sibling avoids retrofitting interactivity-removal onto a
 * component built for the opposite use case — consistent with this
 * project's established pattern (e.g. RecentActivity vs. OrderStatusBadge,
 * Phase 17) of not forcing one component to serve two very different
 * interaction models.
 *
 * PRODUCTION-READY BECAUSE:
 * - Renders nothing broken if a field is missing (falls back to em dash)
 * - "Default" badge shown when `isDefault` is true, matching how the
 *   customer-facing address list marks its default address
 * - Dark mode via `dark:` classes (Convention #6)
 */

const UserAddressCard = ({ address }) => {
  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {address.label || "Address"}
        </p>
        {address.isDefault && (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            Default
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {address.line1 || "—"}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {[address.city, address.state, address.pincode].filter(Boolean).join(", ") || "—"}
      </p>
    </div>
  );
};

export default UserAddressCard;