/**
 * src/services/address.service.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Encapsulates all Address backend API interactions. This service is the single source of truth
 * for Address operations and will be reused by:
 * - Phase 11: Address management (useAddress hook, AddressBook UI)
 * - Phase 12: Checkout (address selector for shipping)
 * - Phase 13: Orders module (display order shipping address)
 * - Future Admin: Address management pages
 * 
 * BACKEND CONTRACT:
 * The backend implements addresses as either:
 * 1. Dedicated Address module: GET/POST /api/address, PUT/DELETE /api/address/:id
 * 2. User sub-module: GET/POST /api/users/:id/addresses, etc.
 * 
 * This service abstracts the endpoint structure. If backend uses different paths,
 * only these functions need to change — no component changes required.
 * 
 * CRITICAL RULES:
 * 1. Service functions NEVER touch React state
 * 2. Service functions ALWAYS return the full Axios response
 * 3. React Query hooks extract: response.data.data (see useAddress for pattern)
 * 4. Frontend NEVER performs validation — backend validates all address data
 * 5. Default address handling is backend responsibility
 * 
 * ADDRESS SHAPE:
 * {
 *   _id: string (MongoDB _id),
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
 * }
 */

import api from "../api/axios";

// Address API endpoints
// IMPORTANT: These paths should match your backend implementation.
// If your backend uses different paths, update these constants.
const ADDRESS_ENDPOINTS = {
  BASE: "/users/addresses",                    // GET all, POST create
  BY_ID: (id) => `/users/addresses/${id}`,     // GET detail, PUT update, DELETE
  SET_DEFAULT: (id) => `/users/addresses/${id}/set-default`, // PATCH set default
};

/**
 * Fetch all addresses for current user
 * 
 * @returns {Promise} Axios response with array of addresses
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: [
 *     { _id, label, fullName, phoneNumber, addressLine1, city, state, postalCode, country, isDefault, ... },
 *     { ... }
 *   ]
 * }
 * 
 * WHEN TO CALL:
 * - On AddressBook page load
 * - After creating a new address (to refresh list)
 * - After deleting an address (to refresh list)
 * - React Query will cache and dedupe with staleTime: 0
 */
export const getAddresses = () => {
  return api.get(ADDRESS_ENDPOINTS.BASE);
};

/**
 * Fetch single address by ID
 * 
 * @param {string} addressId - MongoDB _id of address
 * 
 * @returns {Promise} Axios response with address details
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: { _id, label, fullName, phoneNumber, ... }
 * }
 * 
 * WHEN TO CALL:
 * - Prefill edit form with current address data
 * - Show address details modal
 * 
 * OPTIMIZATION:
 * React Query will cache with key: ["address", addressId]
 */
export const getAddressById = (addressId) => {
  return api.get(ADDRESS_ENDPOINTS.BY_ID(addressId));
};

/**
 * Create a new address
 * 
 * @param {Object} addressData - Address fields
 * {
 *   label: string (e.g., "Home"),
 *   fullName: string,
 *   phoneNumber: string,
 *   addressLine1: string,
 *   addressLine2: string (optional),
 *   city: string,
 *   state: string,
 *   postalCode: string,
 *   country: string,
 *   isDefault: boolean (optional, default false)
 * }
 * 
 * @returns {Promise} Axios response with created address
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: { _id, label, fullName, ... , isDefault: false, createdAt: ... }
 * }
 * 
 * IMPORTANT:
 * - Backend validates all fields
 * - Backend enforces required fields
 * - If isDefault=true, backend updates previous default to false
 * 
 * ERRORS:
 * - 400: Validation failed (missing/invalid fields)
 * - 422: Invalid address data (address validation service)
 * 
 * AFTER CALLING:
 * - React Query should invalidate ["addresses"] query
 * - AddressBook list will refetch and show new address
 * - Success toast: "Address added successfully"
 */
export const createAddress = (addressData) => {
  return api.post(ADDRESS_ENDPOINTS.BASE, addressData);
};

/**
 * Update an existing address
 * 
 * @param {string} addressId - MongoDB _id of address to update
 * @param {Object} addressData - Partial address fields (all fields optional)
 * {
 *   label: string,
 *   fullName: string,
 *   phoneNumber: string,
 *   addressLine1: string,
 *   addressLine2: string,
 *   city: string,
 *   state: string,
 *   postalCode: string,
 *   country: string
 * }
 * 
 * @returns {Promise} Axios response with updated address
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: { _id, label, fullName, ... , updatedAt: ... }
 * }
 * 
 * IMPORTANT:
 * - Only provided fields are updated (partial update)
 * - Backend validates all provided fields
 * - Address _id, isDefault, createdAt, updatedAt cannot be updated via this endpoint
 * - Use setDefaultAddress() to change isDefault
 * 
 * ERRORS:
 * - 404: Address not found
 * - 403: Address belongs to different user
 * - 400: Validation failed
 * 
 * AFTER CALLING:
 * - React Query should invalidate ["addresses"] and ["address", addressId]
 * - AddressBook list will refetch
 * - AddressForm will close
 */
export const updateAddress = (addressId, addressData) => {
  return api.put(ADDRESS_ENDPOINTS.BY_ID(addressId), addressData);
};

/**
 * Delete an address
 * 
 * @param {string} addressId - MongoDB _id of address to delete
 * 
 * @returns {Promise} Axios response
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: { message: "Address deleted successfully" }
 * }
 * 
 * IMPORTANT:
 * - Cannot delete the only address
 * - Cannot delete default address (must set another as default first)
 * - Backend enforces these constraints
 * 
 * ERRORS:
 * - 404: Address not found
 * - 403: Address belongs to different user
 * - 400: Cannot delete (it's the default or only address)
 * 
 * AFTER CALLING:
 * - React Query should invalidate ["addresses"] query
 * - AddressBook list will refetch and show updated list
 * - Success toast: "Address deleted"
 */
export const deleteAddress = (addressId) => {
  return api.delete(ADDRESS_ENDPOINTS.BY_ID(addressId));
};

/**
 * Set an address as the default address
 * 
 * When a user selects an address as default:
 * 1. This endpoint sets isDefault=true on the new address
 * 2. Backend automatically sets isDefault=false on the previous default
 * 3. User can only have ONE default address at a time
 * 
 * @param {string} addressId - MongoDB _id of address to set as default
 * 
 * @returns {Promise} Axios response with updated address
 * 
 * RESPONSE SHAPE:
 * {
 *   success: true,
 *   data: {
 *     _id: addressId,
 *     isDefault: true,
 *     message: "Address set as default"
 *   }
 * }
 * 
 * IMPORTANT:
 * - Backend updates the address with isDefault=true
 * - Backend also updates previous default address to isDefault=false
 * - Only one address can be default
 * 
 * ERRORS:
 * - 404: Address not found
 * - 403: Address belongs to different user
 * 
 * AFTER CALLING:
 * - React Query should invalidate ["addresses"] query
 * - AddressList will refetch and show checkmark on new default
 * - Success toast: "Default address updated"
 * 
 * USAGE IN CHECKOUT:
 * - Phase 12 will use this to set shipping address for order
 * - User selects address, clicks "Use for delivery"
 * - This endpoint called
 * - Checkout flow continues with default address
 */
export const setDefaultAddress = (addressId) => {
  return api.patch(ADDRESS_ENDPOINTS.SET_DEFAULT(addressId));
};