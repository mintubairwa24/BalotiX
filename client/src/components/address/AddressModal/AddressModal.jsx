/**
 * src/components/address/AddressModal/AddressModal.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Modal dialog wrapper for AddressForm (create/edit).
 * Integrates with addressStore for modal state.
 * Handles form submission via useCreateAddress/useUpdateAddress hooks.
 * 
 * Shows:
 * - When isOpen=true
 * - Form mode based on formMode (create/edit)
 * - Loading state during submission
 * 
 * Closes:
 * - After successful submit
 * - When user clicks close button
 * - When user clicks outside modal (optional)
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { AddressForm } from "../../address/AddressForm/AddressForm";
import {
  useCreateAddress,
  useUpdateAddress,
  useAddressById,
} from "../../../hooks/useAddress";
import { useAddressStore } from "../../../store/address.store";

export const AddressModal = () => {
  const {
    isAddressModalOpen,
    closeAddressModal,
    selectedAddressId,
    formMode,
  } = useAddressStore();

  // Fetch existing address for edit mode
  const { data: existingAddress, isLoading: isLoadingAddress } =
    useAddressById(selectedAddressId);

  // Create mutation
  const { mutate: createAddress, isPending: isCreating } = useCreateAddress({
    onSuccess: () => {
      closeAddressModal();
    },
  });

  // Update mutation
  const { mutate: updateAddress, isPending: isUpdating } = useUpdateAddress({
    onSuccess: () => {
      closeAddressModal();
    },
  });

  // Determine if loading
  const isLoading =
    isCreating || isUpdating || (formMode === "edit" && isLoadingAddress);

  // Handle form submit
  const handleSubmit = (data) => {
    if (formMode === "create") {
      createAddress(data);
    } else if (formMode === "edit" && selectedAddressId) {
      updateAddress({
        addressId: selectedAddressId,
        data,
      });
    }
  };

  return (
    <AnimatePresence>
      {isAddressModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAddressModal}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formMode === "create" ? "Add Address" : "Edit Address"}
              </h2>
              <button
                onClick={closeAddressModal}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {isLoadingAddress ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
              ) : (
                <AddressForm
                  mode={formMode}
                  initialValues={existingAddress}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};