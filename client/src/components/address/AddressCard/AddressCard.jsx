/**
 * src/components/address/AddressCard/AddressCard.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays a single address card with all details and action buttons.
 * Shows address info, set-as-default option, edit/delete actions.
 * 
 * Used in:
 * - AddressList (AddressBook page)
 * - AddressSelector (Checkout, Phase 12)
 * 
 * Props:
 * - address: { _id, label, fullName, phoneNumber, addressLine1, city, state, postalCode, country, isDefault }
 * - onEdit: callback to edit this address
 * - onDelete: callback to delete this address
 * - onSetDefault: callback to set as default
 * - isDeleting: boolean (show loading state)
 * - isSettingDefault: boolean (show loading state)
 * - isSelectable: boolean (show radio button for checkout)
 * - isSelected: boolean (radio selected)
 * - onSelect: callback when radio selected (checkout)
 */

import { Check, Edit2, Trash2, MapPin } from "lucide-react";
import { formatPhoneNumber } from "../../../hooks/useAddress";

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting = false,
  isSettingDefault = false,
  isSelectable = false,
  isSelected = false,
  onSelect,
}) => {
  if (!address) return null;

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {/* Header: Label + Default Badge + Selector */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Selector Radio (for checkout) */}
          {isSelectable && (
            <input
              type="radio"
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4 cursor-pointer"
            />
          )}

          {/* Address Label */}
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {address.label}
          </h3>

          {/* Default Badge */}
          {address.isDefault && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-semibold rounded">
              Default
            </span>
          )}
        </div>

        {/* Set as Default Button (only if not default) */}
        {!address.isDefault && !isSelectable && onSetDefault && (
          <button
            onClick={onSetDefault}
            disabled={isSettingDefault}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSettingDefault ? "Setting..." : "Set Default"}
          </button>
        )}
      </div>

      {/* Full Name */}
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
        {address.fullName}
      </p>

      {/* Phone Number */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {formatPhoneNumber(address.phoneNumber)}
      </p>

      {/* Address Details */}
      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <p>
          <span className="inline-block w-20 font-medium text-gray-700 dark:text-gray-300">
            Address:
          </span>
          {address.addressLine1}
          {address.addressLine2 && `, ${address.addressLine2}`}
        </p>
        <p>
          <span className="inline-block w-20 font-medium text-gray-700 dark:text-gray-300">
            City:
          </span>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>
          <span className="inline-block w-20 font-medium text-gray-700 dark:text-gray-300">
            Country:
          </span>
          {address.country}
        </p>
      </div>

      {/* Action Buttons (Edit/Delete, only if not in selector mode) */}
      {!isSelectable && (
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Edit2 size={16} />
              Edit
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      )}

      {/* Selection Indicator (for checkout) */}
      {isSelectable && isSelected && (
        <div className="flex items-center justify-center py-2 text-blue-600 dark:text-blue-400">
          <Check size={20} />
        </div>
      )}
    </div>
  );
};