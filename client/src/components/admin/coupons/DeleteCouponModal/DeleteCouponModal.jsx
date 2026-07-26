/**
 * FILE: src/components/admin/coupons/DeleteCouponModal/DeleteCouponModal.jsx
 *
 * ============================================================================
 * DeleteCouponModal — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The single confirmation gate for deleting a coupon. Reads
 * `deleteModalCouponId` from adminCoupons.store.js — set by CouponActions
 * when the admin clicks the trash icon — and, if non-null, renders a
 * confirm dialog that calls useDeleteCoupon() ONLY after an explicit
 * "Delete" click. Same store-holds-target-id / modal-owns-mutation
 * pattern as every prior delete modal in this project.
 *
 * WHY THIS MODAL ALSO SHOWS USAGE CONTEXT (unlike a plain product delete):
 * Deleting a coupon that customers have already redeemed doesn't undo
 * those past redemptions — but an admin should still see, before
 * confirming, whether this coupon has ANY usage history, since deleting a
 * heavily-used coupon is a more consequential action than deleting one
 * nobody ever applied. Same "advisory warning, backend remains the actual
 * authority" pattern as DeleteCategoryModal's productCount warning
 * (Phase 18B) — this UI doesn't block the delete, it just makes sure the
 * admin isn't confirming blind.
 *
 * WHY SELF-CONTAINED (not importing a shared Modal primitive):
 * Same reasoning as every prior delete modal — avoids an unverified
 * cross-import risking a broken build; swappable later as an isolated
 * follow-up.
 *
 * PRODUCTION-READY BECAUSE:
 * - Backdrop click AND Escape key both close the modal (never delete)
 * - Confirm button disabled while pending; inline error surfaced verbatim
 *   if the backend rejects the delete
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useAdminCouponsStore } from "../../../../store/adminCoupons.store";
import { useDeleteCoupon } from "../../../../hooks/useAdminCoupons";

export const DeleteCouponModal = ({ coupons = [] }) => {
  const couponId = useAdminCouponsStore((s) => s.deleteModalCouponId);
  const closeDeleteModal = useAdminCouponsStore((s) => s.closeDeleteModal);
  const { mutate: deleteCouponMutation, isPending, isError, error, reset } =
    useDeleteCoupon();

  const isOpen = Boolean(couponId);
  const targetCoupon = coupons.find((c) => c._id === couponId);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    reset();
    closeDeleteModal();
  };

  const handleConfirm = () => {
    deleteCouponMutation(couponId, { onSuccess: () => closeDeleteModal() });
  };

  const usageCount = targetCoupon?.usageCount ?? targetCoupon?.usedCount ?? 0;
  const hasBeenUsed = usageCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-coupon-title"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-gray-800"
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>

        <h2 id="delete-coupon-title" className="mb-1 text-base font-semibold text-gray-900 dark:text-gray-50">
          Delete {targetCoupon?.code ? `"${targetCoupon.code}"` : "this coupon"}?
        </h2>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          This deactivates the coupon so it can no longer be redeemed at
          checkout.
        </p>

        {hasBeenUsed && (
          <p className="mb-3 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            This coupon has already been used {usageCount} time
            {usageCount === 1 ? "" : "s"}. Past orders that used
            it are unaffected.
          </p>
        )}

        {isError && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error?.response?.data?.message ??
              "Something went wrong deleting this coupon. Please try again."}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCouponModal;
