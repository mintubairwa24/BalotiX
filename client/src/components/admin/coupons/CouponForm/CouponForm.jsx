/**
 * FILE: src/components/admin/coupons/CouponForm/CouponForm.jsx
 *
 * ============================================================================
 * CouponForm — Phase 18E
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * One shared form component powering BOTH CreateCouponPage and
 * EditCouponPage — exact sibling of ProductForm/CategoryForm. The only
 * difference between "create" and "edit" is whether `initialCoupon` is
 * provided and which mutation hook fires on submit.
 *
 * MONEY HANDLING — THE SANCTIONED RUPEE→PAISE CONVERSION POINT
 * (Convention #1 is strict): `minOrderValue` and `maxDiscountAmount` are
 * displayed/edited in rupees and converted to paise with
 * `Math.round(rupees * 100)` at the single moment of building the submit
 * payload — same "convert once, at the boundary" pattern as ProductForm's
 * price field. `discountValue` is DIFFERENT: it's only money when
 * `discountType === "fixed"` (converted the same way); when
 * `discountType === "percentage"` it's a plain 1–100 number, never
 * converted. This type-dependent handling is the one piece of "business
 * logic" in this form, and it's UI-shaping logic (which field means what),
 * not a duplication of backend discount-calculation logic — the actual
 * discount math at checkout remains entirely backend-owned (Phase 10).
 *
 * BACKEND COMMUNICATION:
 * On submit, builds a plain JS object (no FormData — coupons have no file
 * upload, see coupon.service.js's header) and calls either
 * useCreateCoupon() → POST /coupons or
 * useUpdateCoupon() → PUT /coupons/:id.
 *
 * VALIDATION:
 * Client-side checks are UX guardrails only — code required, discount
 * value required and in-range for its type (1–100 for percentage, >0 for
 * fixed), expiry date required. The backend's own coupon-rule validation
 * (Phase 10) remains the actual source of truth; server-side validation
 * errors surface verbatim in the form-level error banner.
 *
 * PRODUCTION-READY BECAUSE:
 * - Submit button disabled while the mutation is pending — no double-submits
 * - Field-level errors clear as the admin corrects them
 * - maxDiscountAmount field only shows for percentage-type coupons (a
 *   fixed-amount coupon has no "cap" to speak of — its discount IS the
 *   fixed amount), avoiding a confusing always-visible field
 * - Dark mode via `dark:` classes (Convention #6)
 * - On success, navigates back to the coupons list — guaranteed fresh
 *   because both mutations already invalidate the coupons query
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCreateCoupon, useUpdateCoupon } from "../../../../hooks/useAdminCoupons";

const paiseToRupeesString = (paise) =>
  paise === undefined || paise === null || paise === 0 ? "" : (paise / 100).toString();

const toDateInputValue = (isoString) =>
  isoString ? new Date(isoString).toISOString().slice(0, 10) : "";

const toEndOfDayIso = (dateInput) =>
  dateInput ? new Date(`${dateInput}T23:59:59.999Z`).toISOString() : "";

export const CouponForm = ({ mode, initialCoupon }) => {
  const navigate = useNavigate();
  const { mutate: createCouponMutation, isPending: isCreating } = useCreateCoupon();
  const { mutate: updateCouponMutation, isPending: isUpdating } = useUpdateCoupon();
  const isSubmitting = isCreating || isUpdating;
  const initialValidUntil = initialCoupon?.validUntil ?? initialCoupon?.expiryDate;

  const [fields, setFields] = useState({
    code: initialCoupon?.code ?? "",
    discountType: initialCoupon?.discountType ?? "percentage",
    discountValue:
      initialCoupon?.discountType === "fixed"
        ? paiseToRupeesString(initialCoupon?.discountValue)
        : (initialCoupon?.discountValue ?? "").toString(),
    minOrderValueRupees: paiseToRupeesString(initialCoupon?.minOrderValue),
    maxDiscountAmountRupees: paiseToRupeesString(initialCoupon?.maxDiscountAmount),
    validFrom: initialCoupon?.validFrom ?? new Date().toISOString(),
    expiryDate: toDateInputValue(initialValidUntil),
    usageLimit: initialCoupon?.usageLimit?.toString() ?? "",
    isActive: initialCoupon?.isActive ?? true,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const setField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const isPercentage = fields.discountType === "percentage";

  const validate = () => {
    const nextErrors = {};
    if (!fields.code.trim()) nextErrors.code = "Coupon code is required.";

    const discountNum = parseFloat(fields.discountValue);
    if (isNaN(discountNum) || discountNum <= 0) {
      nextErrors.discountValue = "Enter a valid discount greater than 0.";
    } else if (isPercentage && discountNum > 100) {
      nextErrors.discountValue = "Percentage discount cannot exceed 100.";
    }

    if (!fields.expiryDate) nextErrors.expiryDate = "Expiry date is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      code: fields.code.trim().toUpperCase(),
      discountType: fields.discountType,
      // THE sanctioned rupee -> paise conversion point, applied only when
      // discountValue actually represents money (fixed-type discounts).
      discountValue: isPercentage
        ? parseFloat(fields.discountValue)
        : Math.round(parseFloat(fields.discountValue) * 100),
      minOrderValue: fields.minOrderValueRupees
        ? Math.round(parseFloat(fields.minOrderValueRupees) * 100)
        : 0,
      validFrom: fields.validFrom,
      validUntil: toEndOfDayIso(fields.expiryDate),
      usageLimit: fields.usageLimit ? parseInt(fields.usageLimit, 10) : null,
      isActive: fields.isActive,
    };

    if (isPercentage && fields.maxDiscountAmountRupees) {
      payload.maxDiscountAmount = Math.round(
        parseFloat(fields.maxDiscountAmountRupees) * 100
      );
    } else if (!isPercentage) {
      payload.maxDiscountAmount = null;
    }

    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const payload = buildPayload();
    const onSuccess = () => navigate("/admin/coupons");
    const onError = (err) => {
      setSubmitError(
        err?.response?.data?.message ?? "Something went wrong saving this coupon."
      );
    };

    if (mode === "create") {
      createCouponMutation(payload, { onSuccess, onError });
    } else {
      updateCouponMutation({ id: initialCoupon._id, data: payload }, { onSuccess, onError });
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
  const labelClasses = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";
  const errorClasses = "mt-1 text-xs text-red-600 dark:text-red-400";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {submitError}
        </div>
      )}

      <div>
        <label className={labelClasses} htmlFor="code">Coupon Code</label>
        <input
          id="code"
          type="text"
          value={fields.code}
          onChange={(e) => setField("code", e.target.value.toUpperCase())}
          className={`${inputClasses} font-mono`}
          placeholder="e.g. SAVE20"
        />
        {errors.code && <p className={errorClasses}>{errors.code}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="discountType">Discount Type</label>
          <select
            id="discountType"
            value={fields.discountType}
            onChange={(e) => setField("discountType", e.target.value)}
            className={inputClasses}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>

        <div>
          <label className={labelClasses} htmlFor="discountValue">
            Discount Value {isPercentage ? "(%)" : "(₹)"}
          </label>
          <input
            id="discountValue"
            type="number"
            min="0"
            max={isPercentage ? 100 : undefined}
            step={isPercentage ? "1" : "0.01"}
            value={fields.discountValue}
            onChange={(e) => setField("discountValue", e.target.value)}
            className={inputClasses}
            placeholder={isPercentage ? "20" : "100.00"}
          />
          {errors.discountValue && <p className={errorClasses}>{errors.discountValue}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="minOrderValue">Minimum Order Value (₹)</label>
          <input
            id="minOrderValue"
            type="number"
            min="0"
            step="0.01"
            value={fields.minOrderValueRupees}
            onChange={(e) => setField("minOrderValueRupees", e.target.value)}
            className={inputClasses}
            placeholder="0.00 (no minimum)"
          />
        </div>

        {isPercentage && (
          <div>
            <label className={labelClasses} htmlFor="maxDiscountAmount">
              Max Discount Cap (₹)
            </label>
            <input
              id="maxDiscountAmount"
              type="number"
              min="0"
              step="0.01"
              value={fields.maxDiscountAmountRupees}
              onChange={(e) => setField("maxDiscountAmountRupees", e.target.value)}
              className={inputClasses}
              placeholder="0.00 (no cap)"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="expiryDate">Expiry Date</label>
          <input
            id="expiryDate"
            type="date"
            value={fields.expiryDate}
            onChange={(e) => setField("expiryDate", e.target.value)}
            className={inputClasses}
          />
          {errors.expiryDate && <p className={errorClasses}>{errors.expiryDate}</p>}
        </div>

        <div>
          <label className={labelClasses} htmlFor="usageLimit">Usage Limit</label>
          <input
            id="usageLimit"
            type="number"
            min="0"
            value={fields.usageLimit}
            onChange={(e) => setField("usageLimit", e.target.value)}
            className={inputClasses}
            placeholder="Leave blank for unlimited"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={fields.isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        Active (redeemable at checkout)
      </label>

      <div className="flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Coupon" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/coupons")}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CouponForm;
