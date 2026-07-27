/**
 * COMPONENT: src/components/admin/orders/OrderActions/OrderActions.jsx
 *
 * PURPOSE:
 * Action buttons for a single order row. Opens the UpdateStatusModal
 * for the specific order.
 *
 * REUSES:
 * adminOrders.store.js for modal state management — same pattern as
 * ProductActions -> DeleteProductModal in Phase 18A.
 *
 * Only shows status update for non-terminal orders (backend prevents
 * transitions from "delivered", "cancelled", "refunded").
 */

import { ArrowUpDown } from "lucide-react";
import { useAdminOrdersStore } from "../../../../store/adminOrders.store";

const TERMINAL_STATUSES = ["delivered", "cancelled", "refunded"];

export const OrderActions = ({ order }) => {
  const openUpdateStatusModal = useAdminOrdersStore(
    (s) => s.openUpdateStatusModal
  );

  if (TERMINAL_STATUSES.includes(order.status)) return null;

  return (
    <button
      onClick={() => openUpdateStatusModal(order)}
      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
    >
      <ArrowUpDown className="h-3.5 w-3.5" />
      Update Status
    </button>
  );
};

export default OrderActions;

