/**
 * src/store/address.store.js
 * 
 * ARCHITECTURAL PURPOSE:
 * Manages ADDRESS UI STATE ONLY (not server address data).
 * 
 * React Query owns the server state:
 *   - Fetched addresses from /api/address
 *   - Address details (single address)
 *   - Handled by useAddress hooks
 * 
 * Zustand owns these UI toggles:
 *   - isAddressModalOpen (form modal visible or not)
 *   - selectedAddressId (which address is being edited)
 *   - formMode (create new or edit existing)
 * 
 * SEPARATION OF CONCERNS:
 * This keeps the store minimal and focused on UI behavior, not data persistence.
 * The useAddress hooks bring React Query data + address.store UI state together.
 * 
 * USE CASES:
 * 1. User clicks "Add Address" → openAddressModal("create") → Form appears
 * 2. User fills form → submits → useCreateAddress() → server persists
 * 3. Success → closeAddressModal() → Modal closes, list refetches
 * 4. User clicks "Edit" on address card → openAddressModal("edit", addressId)
 * 5. useAddressById() loads current address data
 * 6. Form prefilled with current data
 * 7. User submits update → useUpdateAddress() → success → closeAddressModal()
 * 
 * PERSISTENCE:
 * Address UI state does NOT persist to localStorage.
 * On page refresh, modal closes (sensible UX).
 * Server data (addresses) refetch automatically via React Query.
 * 
 * REUSABILITY:
 * This pattern will be extended in future phases:
 * - Phase 12 Checkout: addressSelector state (which address for shipping)
 * - Phase 13 Orders: addressDisplay state (view order shipping address)
 * - Future Admin: addressManagement state
 */

import { create } from "zustand";

/**
 * Address UI State
 * 
 * This is NOT the actual address data — that comes from useAddresses (React Query).
 * This is for UI chrome: modals, forms, selection state, etc.
 */
export const useAddressStore = create((set, get) => ({
  // Is address modal (create/edit form) open?
  isAddressModalOpen: false,

  // Which address is being edited? (null if creating new)
  selectedAddressId: null,

  // Form mode: "create" (new address) or "edit" (existing address)
  formMode: "create",

  /**
   * Open the address modal for creating a new address
   * Used when user clicks "Add New Address" button
   */
  openAddressModalForCreate: () =>
    set(() => ({
      isAddressModalOpen: true,
      selectedAddressId: null,
      formMode: "create",
    })),

  /**
   * Open the address modal for editing an existing address
   * Used when user clicks "Edit" on an address card
   * 
   * @param {string} addressId - ID of address to edit
   */
  openAddressModalForEdit: (addressId) =>
    set(() => ({
      isAddressModalOpen: true,
      selectedAddressId: addressId,
      formMode: "edit",
    })),

  /**
   * Close the address modal
   * Called after:
   * - User successfully creates/updates address
   * - User clicks cancel button
   * - User clicks outside modal (if clickaway enabled)
   */
  closeAddressModal: () =>
    set(() => ({
      isAddressModalOpen: false,
      selectedAddressId: null,
      formMode: "create",
    })),

  /**
   * Toggle modal open/closed
   * Convenience method
   */
  toggleAddressModal: () =>
    set((state) => ({
      isAddressModalOpen: !state.isAddressModalOpen,
    })),

  /**
   * Set which address is being edited
   * Called after user clicks edit button
   * 
   * @param {string} addressId - Address to edit
   */
  setSelectedAddressId: (addressId) =>
    set(() => ({
      selectedAddressId: addressId,
    })),

  /**
   * Clear selected address
   * Called when canceling edit
   */
  clearSelectedAddressId: () =>
    set(() => ({
      selectedAddressId: null,
    })),

  /**
   * Set the form mode (create or edit)
   * 
   * @param {string} mode - "create" or "edit"
   */
  setFormMode: (mode) =>
    set(() => ({
      formMode: mode,
    })),

  /**
   * Reset all address UI state to defaults
   * Nuclear option - called when:
   * - User logs out
   * - Page navigation
   * - Error recovery
   */
  resetAddressStore: () =>
    set(() => ({
      isAddressModalOpen: false,
      selectedAddressId: null,
      formMode: "create",
    })),
}));