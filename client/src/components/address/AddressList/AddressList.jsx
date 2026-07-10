/**
 * src/components/address/AddressList/AddressList.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Container component that renders list of AddressCards.
 * Handles mutations (delete, set default) and UI feedback.
 * 
 * Props:
 * - addresses: array of address objects
 * - onEditAddress: callback with addressId
 * - isSelectable: boolean (for checkout)
 * - selectedAddressId: string (for checkout)
 * - onSelectAddress: callback with addressId (for checkout)
 */

import { useState } from "react";
import { AddressCard } from "../../address/AddressCard/AddressCard";
import {
  useDeleteAddress,
  useSetDefaultAddress,
} from "../../../hooks/useAddress";

export const AddressList = ({
  addresses,
  onEditAddress,
  isSelectable = false,
  selectedAddressId = null,
  onSelectAddress,
}) => {
  // Mutations
  const { mutate: deleteAddress, isPending: isDeleting } = useDeleteAddress();
  const {
    mutate: setDefaultAddress,
    isPending: isSettingDefault,
  } = useSetDefaultAddress();

  // Track which address is currently loading
  const [deletingAddressId, setDeletingAddressId] = useState(null);
  const [settingDefaultAddressId, setSettingDefaultAddressId] = useState(null);

  const handleDelete = (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setDeletingAddressId(addressId);
      deleteAddress(addressId, {
        onSuccess: () => setDeletingAddressId(null),
        onError: () => setDeletingAddressId(null),
      });
    }
  };

  const handleSetDefault = (addressId) => {
    setSettingDefaultAddressId(addressId);
    setDefaultAddress(addressId, {
      onSuccess: () => setSettingDefaultAddressId(null),
      onError: () => setSettingDefaultAddressId(null),
    });
  };

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <AddressCard
          key={address._id}
          address={address}
          onEdit={() => onEditAddress?.(address._id)}
          onDelete={() => handleDelete(address._id)}
          onSetDefault={() => handleSetDefault(address._id)}
          isDeleting={deletingAddressId === address._id}
          isSettingDefault={settingDefaultAddressId === address._id}
          isSelectable={isSelectable}
          isSelected={isSelectable && selectedAddressId === address._id}
          onSelect={() => onSelectAddress?.(address._id)}
        />
      ))}
    </div>
  );
};