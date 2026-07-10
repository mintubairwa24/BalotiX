/**
 * src/pages/user/AddressBookPage.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Full Address Book page displayed at route /address
 * Shows user's saved addresses with full CRUD capabilities.
 * 
 * Features:
 * - List all addresses
 * - Add new address (modal form)
 * - Edit address (modal form with prefilled data)
 * - Delete address (confirmation)
 * - Set default address
 * - Empty state when no addresses
 * - Loading skeleton while fetching
 * - Error state with retry
 * 
 * Route: /address (protected - requires authentication)
 * 
 * Integrations:
 * - useAddresses hook (fetch)
 * - useAddressStore (modal state)
 * - AddressModal (create/edit form)
 * - AddressList (address cards)
 * - AddressEmpty (empty state)
 * - AddressSkeleton (loading state)
 */

import { useAddresses } from "../../hooks/useAddress";
import { useAddressStore } from "../../store/address.store";
// import {
//   AddressList,
//   AddressModal,
//   AddressEmpty,
//   AddressSkeleton,
// } from "../../components/address/";
import { AddressList } from "../../components/address/AddressList/AddressList";
import { AddressSkeleton } from "../../components/address/AddressSkeleton/AddressSkeleton";
import { AddressModal } from "../../components/address/AddressModal/AddressModal";
import { AddressEmpty } from "../../components/address/AddressEmpty/AddressEmpty";
import { Plus, AlertCircle } from "lucide-react";

export const AddressBookPage = () => {
  // Fetch addresses
  const {
    data: addresses,
    isLoading,
    isError,
    error,
    refetch,
  } = useAddresses();

  // Modal state
  const { openAddressModalForCreate, openAddressModalForEdit } =
    useAddressStore();

  // Handle edit click
  const handleEditAddress = (addressId) => {
    openAddressModalForEdit(addressId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Address Book
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your delivery addresses
            </p>
          </div>

          {/* Add Address Button */}
          {(addresses?.length || 0) > 0 && (
            <button
              onClick={() => openAddressModalForCreate()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Address
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <AddressSkeleton count={3} />
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Failed to load addresses
              </h3>
              <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                {error?.message || "Something went wrong"}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && (!addresses || addresses.length === 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg">
            <AddressEmpty onAddClick={() => openAddressModalForCreate()} />
          </div>
        )}

        {/* Address List */}
        {!isLoading && !isError && addresses && addresses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <AddressList
              addresses={addresses}
              onEditAddress={handleEditAddress}
              isSelectable={false}
            />
          </div>
        )}
      </div>

      {/* Address Modal (Create/Edit) */}
      <AddressModal />
    </div>
  );
};