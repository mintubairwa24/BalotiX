/**
 * src/components/checkout/CheckoutAddress/CheckoutAddress.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Thin wrapper around the EXISTING AddressSelector component (Phase 11).
 * This file does NOT reimplement address selection UI — it only:
 * 1. Fetches addresses via useAddresses (Phase 11 hook)
 * 2. Auto-selects the default address on first load (checkout UX nicety)
 * 3. Wires selection into checkout.store (this phase's UI state)
 * 4. Opens the existing AddressModal (Phase 11) for "Add New Address"
 * 
 * REUSE, NOT DUPLICATION:
 * - AddressSelector (Phase 11) — renders the actual selectable cards
 * - AddressModal (Phase 11) — handles the "add new address" form
 * - useAddresses (Phase 11) — fetches the address list
 * - useAddressStore (Phase 11) — controls the AddressModal open state
 * 
 * This keeps checkout consistent with the Address Book UX instead of
 * inventing a parallel address form.
 */

import { useEffect } from "react";
import { AddressSelector } from "../../address/AddressSelector/AddressSelector";
import { AddressModal } from "../../address/AddressModal/AddressModal";
import { useAddresses } from "../../../hooks/useAddress";
import { useAddressStore } from "../../../store/address.store";
import { useCheckoutStore } from "../../../store/checkout.store";

export const CheckoutAddress = () => {
  const { data: addresses, isLoading } = useAddresses();
  const { openAddressModalForCreate } = useAddressStore();
  const { selectedAddressId, setSelectedAddressId } = useCheckoutStore();

  // Auto-select default address on first load (only if nothing selected yet)
  useEffect(() => {
    if (!selectedAddressId && addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const handleContinue = () => {
    const target = document.getElementById("checkout-actions");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <AddressSelector
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
        onAddNew={() => openAddressModalForCreate()}
        onContinue={handleContinue}
        isLoading={isLoading}
      />

      {/* Reused from Phase 11 — handles create/edit form in a modal */}
      <AddressModal />
    </div>
  );
};