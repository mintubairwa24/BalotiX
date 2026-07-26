/**
 * FILE: src/components/admin/inventory/StockAdjustmentForm/StockAdjustmentForm.jsx
 *
 * Phase 18F stock adjustment form.
 * Submits the signed quantity + note contract expected by the backend.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAdjustStock } from "../../../../hooks/useAdminInventory";

export const StockAdjustmentForm = ({ productId, currentStock, onSuccess }) => {
  const { mutate: adjustStockMutation, isPending, isError, error, reset } = useAdjustStock();

  const [type, setType] = useState("increase");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState("");

  const isSet = type === "set";

  const handleSubmit = (e) => {
    e.preventDefault();
    reset();
    setValidationError("");

    const qtyNum = Number.parseInt(quantity, 10);
    if (Number.isNaN(qtyNum) || qtyNum < 0 || (!isSet && qtyNum <= 0)) {
      setValidationError(
        isSet
          ? "Enter a valid target stock quantity (0 or more)."
          : "Enter a valid quantity greater than 0."
      );
      return;
    }

    if (isSet && typeof currentStock !== "number") {
      setValidationError("Current stock is required to set an exact value.");
      return;
    }

    const trimmedNote = note.trim();
    if (trimmedNote.length < 5) {
      setValidationError("Add a note explaining the stock change.");
      return;
    }

    const delta =
      type === "increase"
        ? qtyNum
        : type === "decrease"
          ? -qtyNum
          : qtyNum - currentStock;

    if (type === "set" && delta === 0) {
      setValidationError("The target stock must be different from the current stock.");
      return;
    }

    adjustStockMutation(
      {
        productId,
        adjustment: { quantity: delta, note: trimmedNote },
      },
      {
        onSuccess: () => {
          setQuantity("");
          setNote("");
          onSuccess?.();
        },
      }
    );
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
  const labelClasses = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClasses} htmlFor="adjustment-type">
          Adjustment Type
        </label>
        <select
          id="adjustment-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClasses}
        >
          <option value="increase">Increase stock by</option>
          <option value="decrease">Decrease stock by</option>
          <option value="set">Set stock to</option>
        </select>
      </div>

      <div>
        <label className={labelClasses} htmlFor="adjustment-quantity">
          {isSet ? "Target Stock Quantity" : "Quantity"}
        </label>
        <input
          id="adjustment-quantity"
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={inputClasses}
          placeholder={isSet ? "e.g. 50" : "e.g. 10"}
        />
        {isSet && typeof currentStock === "number" && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Current stock: {currentStock}
          </p>
        )}
      </div>

      <div>
        <label className={labelClasses} htmlFor="adjustment-note">
          Note
        </label>
        <input
          id="adjustment-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={inputClasses}
          placeholder="e.g. Restocked from supplier, damaged units, cycle count"
        />
      </div>

      {(validationError || isError) && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {validationError ||
            error?.response?.data?.message ||
            "Something went wrong adjusting stock. Please try again."}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Saving..." : "Update Stock"}
      </button>
    </form>
  );
};

export default StockAdjustmentForm;
