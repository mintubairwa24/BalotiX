/**
 * src/components/address/AddressSelector/AddressSelector.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Specialized address selection component for checkout flow (Phase 12).
 * Allows user to:
 * 1. View all addresses
 * 2. Select which address to use for shipping
 * 3. Set selected address as default
 * 4. Add new address if needed
 * 
 * Used ONLY in checkout, not in AddressBook.
 * 
 * Props:
 * - addresses: array of addresses
 * - selectedAddressId: currently selected address ID
 * - onSelectAddress: callback with selected addressId
 * - onAddNew: callback to open add-address form
 * - isLoading: boolean
 * - isSelecting: boolean (show loading during selection)
 */

import { Plus } from "lucide-react";
import { AddressCard } from "../AddressCard/AddressCard";
import { useSetDefaultAddress } from "../../../hooks/useAddress";
import { useState } from "react";

export const AddressSelector = ({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
  isLoading = false,
  isSelecting = false,
}) => {
  const { mutate: setDefault, isPending: isSettingDefault } =
    useSetDefaultAddress();
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  const handleSetDefault = (addressId) => {
    setSettingDefaultId(addressId);
    setDefault(addressId, {
      onSuccess: () => setSettingDefaultId(null),
      onError: () => setSettingDefaultId(null),
    });
  };

  if (isLoading) {
    return <div className="text-center text-gray-500 py-8">Loading addresses...</div>;
  }

  if (!addresses || addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No addresses saved yet
        </p>
        {onAddNew && (
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus size={16} className="inline mr-2" />
            Add Address
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Heading */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Select Shipping Address
      </h3>

      {/* Address List (Selectable) */}
      <div className="space-y-3 mb-4">
        {addresses.map((address) => (
          <AddressCard
            key={address._id}
            address={address}
            isSelectable={true}
            isSelected={selectedAddressId === address._id}
            onSelect={() => onSelectAddress?.(address._id)}
            onSetDefault={() => handleSetDefault(address._id)}
            isSettingDefault={settingDefaultId === address._id}
          />
        ))}
      </div>

      {/* Add New Address Button */}
      {onAddNew && (
        <button
          onClick={onAddNew}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium rounded-lg transition-colors"
        >
          <Plus size={18} className="inline mr-2" />
          Add New Address
        </button>
      )}

      {/* Continue Button */}
      {selectedAddressId && (
        <button
          disabled={isSelecting}
          className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isSelecting ? "Continuing..." : "Continue to Payment"}
        </button>
      )}
    </div>
  );
};