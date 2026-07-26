/**
 * src/components/orders/OrderAddress/OrderAddress.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays the shipping address snapshot stored on the order, DIRECTLY
 * REUSING AddressCard (Phase 11) rather than building a parallel
 * address-display component.
 * 
 * WHY THIS REUSE IS SAFE:
 * AddressCard (Phase 11) already supports a read-only mode: when no
 * `onEdit`/`onDelete`/`onSetDefault` handlers are passed and
 * `isSelectable` is false (its defaults), it renders purely as a
 * display card with no interactive buttons. That's exactly what an
 * order's shipping address needs — it's a permanent, immutable
 * snapshot taken at order-creation time (Phase 12), and must NEVER be
 * editable or deletable from here, since doing so would rewrite
 * history for an already-placed order.
 * 
 * IMPORTANT DATA NUANCE:
 * order.shippingAddress is a SNAPSHOT (plain object copied at order
 * creation), not a live reference to the user's saved AddressBook
 * entry — it may not have an `_id`, `isDefault`, or other Address-Book-
 * specific fields, and that's fine because AddressCard only requires
 * the display fields (fullName, phoneNumber, addressLine1, city, etc.)
 * to render; it degrades gracefully when isDefault/_id are absent.
 * 
 * Props:
 * - address: order.shippingAddress (snapshot object from getOrderById)
 */

import { AddressCard } from "../../address/AddressCard/AddressCard";

export const OrderAddress = ({ address }) => {
  if (!address) return null;

  return (
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
        Shipping Address
      </h3>
      {/* No onEdit/onDelete/onSetDefault passed — renders read-only */}
      <AddressCard address={address} />
    </div>
  );
};