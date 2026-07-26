/**
 * src/components/address/AddressEmpty/AddressEmpty.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Empty state component shown when user has no saved addresses.
 * Provides friendly message and CTA to add first address.
 * 
 * Shows when:
 * - User hasn't added any addresses yet
 * - Last address was deleted
 * 
 * Reusable in:
 * - AddressBook page (src/pages/user/AddressBookPage.jsx)
 * - Checkout address selector (Phase 12)
 */

import { MapPin } from "lucide-react";

export const AddressEmpty = ({ onAddClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Icon */}
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
        <MapPin size={40} className="text-gray-400 dark:text-gray-500" />
      </div>

      {/* Message */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No addresses yet
      </h3>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 max-w-sm mb-6">
        You haven't added any addresses yet. Add your first address to get started with faster checkout.
      </p>

      {/* CTA Button */}
      {onAddClick && (
        <button
          onClick={onAddClick}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Add Address
        </button>
      )}
    </div>
  );
};