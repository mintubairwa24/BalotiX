/**
 * src/hooks/useAddress.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Address-specific React Query hooks that encapsulate all address operations.
 * This is the ONLY way to interact with address data from components.
 * 
 * Provides:
 * 1. useAddresses() - Fetch all addresses (query)
 * 2. useAddressById() - Fetch single address (query)
 * 3. useCreateAddress() - Create mutation
 * 4. useUpdateAddress() - Update mutation
 * 5. useDeleteAddress() - Delete mutation
 * 6. useSetDefaultAddress() - Set default mutation
 * 7. Utility: formatPhoneNumber() - Format phone display
 * 
 * STATE MANAGEMENT:
 * - React Query owns address server state (fetched addresses, details)
 * - React Query owns cache and invalidation
 * - Zustand owns UI state (modal open/close, form state)
 * 
 * ERROR HANDLING:
 * - 404: Address not found
 * - 403: Not your address
 * - 400: Validation failed
 * - All errors trigger toast with backend message
 * 
 * CACHE INVALIDATION STRATEGY:
 * After mutations:
 * - invalidateQueries(["addresses"]) - Refresh address list
 * - invalidateQueries(["address", id]) - Refresh specific address (if detail view)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as addressService from "../services/address.service";

const ADDRESSES_QUERY_KEY = ["addresses"];
const ADDRESS_QUERY_KEY = (id) => ["address", id];

const getValidationMessage = (error, fallback) => {
  const errors = error?.response?.data?.errors;

  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((err) => err.message).join(" | ");
  }

  return error?.response?.data?.message || fallback;
};

/**
 * Fetch all addresses for current user
 * 
 * @returns {Object} { data: addresses[], isLoading, error, isError, refetch }
 * 
 * Data shape:
 * [{
 *   _id: string,
 *   label: string (e.g., "Home", "Office"),
 *   fullName: string,
 *   phoneNumber: string,
 *   addressLine1: string,
 *   addressLine2: string (optional),
 *   city: string,
 *   state: string,
 *   postalCode: string,
 *   country: string,
 *   isDefault: boolean,
 *   createdAt: ISO timestamp,
 *   updatedAt: ISO timestamp
 * }]
 * 
 * USAGE:
 * const { data: addresses, isLoading } = useAddresses();
 * 
 * if (isLoading) return <AddressSkeleton />;
 * if (!addresses?.length) return <AddressEmpty />;
 * return <AddressList addresses={addresses} />;
 */
export const useAddresses = () => {
  return useQuery({
    queryKey: ADDRESSES_QUERY_KEY,
    queryFn: async () => {
      const response = await addressService.getAddresses();
      return response.data.data?.addresses ?? [];
    },
    staleTime: 0, // Always treat as fresh
    gcTime: 1000 * 60 * 5, // 5 min in memory after unused
    retry: 1,
  });
};

/**
 * Fetch single address by ID
 * 
 * @param {string} addressId - MongoDB _id of address
 * @returns {Object} { data: address, isLoading, error, isError }
 * 
 * USAGE:
 * const { data: address } = useAddressById(addressId);
 * 
 * // In edit form:
 * <AddressForm initialValues={address} />
 * 
 * // In address detail view:
 * <AddressCard address={address} />
 */
export const useAddressById = (addressId) => {
  return useQuery({
    queryKey: ADDRESS_QUERY_KEY(addressId),
    queryFn: async () => {
      if (!addressId) return null;
      const response = await addressService.getAddressById(addressId);
      return response.data.data;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    enabled: !!addressId, // Don't run if no ID
  });
};

/**
 * Create a new address
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending, isError }
 * 
 * USAGE:
 * const { mutate: createAddress, isPending } = useCreateAddress({
 *   onSuccess: () => {
 *     closeAddressForm();
 *     // Success toast auto-shown
 *   }
 * });
 * 
 * createAddress({
 *   label: "Home",
 *   fullName: "John Doe",
 *   phoneNumber: "+91 98765 43210",
 *   addressLine1: "123 Main St",
 *   city: "Mumbai",
 *   state: "Maharashtra",
 *   postalCode: "400001",
 *   country: "India",
 *   isDefault: false
 * });
 * 
 * ERRORS:
 * - 400: Validation failed (required fields, format)
 * - All errors trigger toast with backend message
 * 
 * AFTER SUCCESS:
 * - ["addresses"] query invalidated and refetched
 * - AddressList updates automatically
 * - AddressForm closes
 * - Success toast: "Address added successfully"
 */
export const useCreateAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressData) => addressService.createAddress(addressData),
    onSuccess: (response) => {
      // Invalidate address list to refetch
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });

      toast.success("Address added successfully");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message = getValidationMessage(error, "Failed to add address");
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Update an existing address
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: updateAddress, isPending } = useUpdateAddress({
 *   onSuccess: () => closeAddressForm()
 * });
 * 
 * updateAddress({
 *   addressId: "507f1f77bcf86cd799439011",
 *   data: { phoneNumber: "+91 98765 54321" } // Partial update
 * });
 * 
 * BEHAVIOR:
 * - Only provided fields are updated
 * - Backend validates all fields
 * - After success, both address list and this specific address queries invalidated
 */
export const useUpdateAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ addressId, data }) =>
      addressService.updateAddress(addressId, data),
    onSuccess: (response) => {
      // Invalidate both list and specific address
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ADDRESS_QUERY_KEY(response.data.data._id),
      });

      toast.success("Address updated");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message = getValidationMessage(error, "Failed to update address");
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Delete an address
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: deleteAddress, isPending } = useDeleteAddress();
 * 
 * deleteAddress(addressId);
 * 
 * CONSTRAINTS (backend enforced):
 * - Cannot delete the only address
 * - Cannot delete default address (must set another default first)
 * 
 * ERRORS:
 * - 400: Cannot delete (is default or only address)
 * - 404: Address not found
 */
export const useDeleteAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId) => addressService.deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
      toast.success("Address deleted");

      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to delete address";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Set an address as the default address
 * 
 * @param {Object} options - { onSuccess, onError }
 * @returns {Object} { mutate, isPending }
 * 
 * USAGE:
 * const { mutate: setDefault, isPending } = useSetDefaultAddress({
 *   onSuccess: () => {
 *     // List will refetch and show updated default
 *   }
 * });
 * 
 * setDefault(addressId);
 * 
 * AFTER SUCCESS:
 * - Old default address gets isDefault=false
 * - New address gets isDefault=true
 * - AddressList shows checkmark on new default
 * - Success toast: "Default address updated"
 * 
 * USAGE IN CHECKOUT:
 * - Phase 12 will call this when user selects address for shipping
 * - After success, checkout flow uses this address
 */
export const useSetDefaultAddress = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId) => addressService.setDefaultAddress(addressId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
      toast.success("Default address updated");

      if (options.onSuccess) {
        options.onSuccess(response.data.data);
      }
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Failed to update default address";
      toast.error(message);

      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * UTILITY: Format phone number for display
 * 
 * Handles various phone number formats and normalizes display.
 * 
 * @param {string} phoneNumber - Phone number string
 * @returns {string} Formatted phone number
 * 
 * USAGE:
 * <p>Phone: {formatPhoneNumber(address.phoneNumber)}</p>
 * 
 * EXAMPLES:
 * formatPhoneNumber("9876543210") → "+91 98765 43210"
 * formatPhoneNumber("+91-98765-43210") → "+91 98765 43210"
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";

  // Remove all non-digit characters except leading +
  let cleaned = phoneNumber.replace(/[^\d+]/g, "");

  // If no country code, assume +91 (India)
  if (!cleaned.startsWith("+")) {
    cleaned = "+91" + cleaned;
  }

  // Format as: +91 98765 43210
  const match = cleaned.match(/^(\+?\d{1,3})(\d{5})(\d{5})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`;
  }

  return phoneNumber;
};

/**
 * UTILITY: Format address for display
 * 
 * Combines address fields into single readable string.
 * 
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 * 
 * USAGE:
 * <p>{formatAddressDisplay(address)}</p>
 * 
 * OUTPUT:
 * "123 Main St, Mumbai, Maharashtra 400001, India"
 */
export const formatAddressDisplay = (address) => {
  if (!address) return "";

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return parts.join(", ");
};