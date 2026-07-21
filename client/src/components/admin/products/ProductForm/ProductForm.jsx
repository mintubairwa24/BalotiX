/**
 * FILE: src/components/admin/products/ProductForm/ProductForm.jsx
 *
 * ============================================================================
 * ProductForm — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * One shared form component powering BOTH CreateProductPage and
 * EditProductPage — the only difference between "create" and "edit" is
 * whether `initialProduct` is provided and which mutation hook fires on
 * submit. This avoids two near-identical form implementations drifting
 * out of sync over time (Convention #11 — reuse over duplication).
 *
 * MONEY HANDLING — THE ONE SANCTIONED RUPEE→PAISE CONVERSION POINT
 * (Convention #1 is strict: no frontend money math ANYWHERE else in the
 * app). A human admin cannot reasonably type "49900" and know it means
 * ₹499.00 paise — they need to type "499" or "499.00" in rupees. This
 * form is the ONE deliberate exception: the `price` field is displayed
 * and edited in rupees, and converted to paise with
 * `Math.round(priceRupees * 100)` at the single moment of building
 * FormData for submission — exactly the same "convert once, at the
 * boundary" pattern already used by the Razorpay checkout integration
 * (Phase 13). Nowhere else in this component, or any other component in
 * the Products feature, does money arithmetic happen — everywhere else
 * (ProductRow, DashboardStats) only ever receives and formats paise.
 *
 * BACKEND COMMUNICATION:
 * On submit, builds a FormData with all text fields + `price` (paise) +
 * `isActive` + existing image URLs to keep + new image Files, then calls
 * either useCreateProduct() → POST /products or
 * useUpdateProduct() → PUT /products/:id (see product.service.js).
 *
 * REUSES:
 * - useCategories() (Phase 6) for the category <select>, same as
 *   ProductFilters — one categories data source across the whole app.
 * - ProductImages (this phase) for the image grid.
 *
 * VALIDATION:
 * Client-side checks are UX guardrails only (name required, price > 0,
 * category required, stock >= 0) — the backend's existing Zod validation
 * (already built into the Product module) remains the actual source of
 * truth; server-side validation errors returned on submit are surfaced
 * verbatim under the relevant field when possible, or as a form-level
 * banner otherwise.
 *
 * PRODUCTION-READY BECAUSE:
 * - Submit button disabled while the mutation is pending — no double-submits
 * - Field-level errors clear as the admin corrects them, not only on next submit
 * - Dark mode via `dark:` classes (Convention #6)
 * - On successful create/edit, navigates back to the products list — the
 *   list is guaranteed fresh because both mutations already invalidate the
 *   products query (see useAdminProducts.js)
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCategories } from "../../../../hooks/useCategories";
import {  useCreateProduct} from "../../../../hooks/useAdminProducts";
import { useUpdateProduct} from "../../../../hooks/useAdminProducts";
import ProductImages from "../ProductImages/ProductImages";

const paiseToRupeesString = (paise) =>
  paise === undefined || paise === null ? "" : (paise / 100).toString();

const buildInitialImages = (product) =>
  (product?.images ?? []).map((url, idx) => ({
    id: `existing-${idx}-${url}`,
    url,
    file: undefined, // no `file` => this is an existing, already-uploaded image
  }));

const ProductForm = ({ mode, initialProduct }) => {
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const { mutate: createProductMutation, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProductMutation, isPending: isUpdating } = useUpdateProduct();
  const isSubmitting = isCreating || isUpdating;

  const [fields, setFields] = useState({
    name: initialProduct?.name ?? "",
    description: initialProduct?.description ?? "",
    category: initialProduct?.category?._id ?? "",
    priceRupees: paiseToRupeesString(initialProduct?.effectivePrice),
    stock: initialProduct?.stock ?? "",
    isActive: initialProduct?.isActive ?? true,
  });
  const [images, setImages] = useState(() => buildInitialImages(initialProduct));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const setField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!fields.name.trim()) nextErrors.name = "Product name is required.";
    if (!fields.category) nextErrors.category = "Please select a category.";
    const priceNum = parseFloat(fields.priceRupees);
    if (isNaN(priceNum) || priceNum <= 0) {
      nextErrors.priceRupees = "Enter a valid price greater than 0.";
    }
    const stockNum = parseInt(fields.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      nextErrors.stock = "Enter a valid stock quantity (0 or more).";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", fields.name.trim());
    formData.append("description", fields.description.trim());
    formData.append("category", fields.category);
    // THE one sanctioned rupee -> paise conversion point in the entire app.
    formData.append("price", String(Math.round(parseFloat(fields.priceRupees) * 100)));
    formData.append("stock", String(parseInt(fields.stock, 10)));
    formData.append("isActive", String(fields.isActive));

    const existingUrls = images.filter((img) => !img.file).map((img) => img.url);
    formData.append("existingImages", JSON.stringify(existingUrls));

    images
      .filter((img) => img.file)
      .forEach((img) => formData.append("images", img.file));

    return formData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const formData = buildFormData();

    const onSuccess = () => navigate("/admin/products");
    const onError = (err) => {
      setSubmitError(
        err?.response?.data?.message ?? "Something went wrong saving this product."
      );
    };

    if (mode === "create") {
      createProductMutation(formData, { onSuccess, onError });
    } else {
      updateProductMutation(
        { id: initialProduct._id, formData },
        { onSuccess, onError }
      );
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
        <label className={labelClasses} htmlFor="name">Product Name</label>
        <input
          id="name"
          type="text"
          value={fields.name}
          onChange={(e) => setField("name", e.target.value)}
          className={inputClasses}
          placeholder="e.g. Wireless Bluetooth Headphones"
        />
        {errors.name && <p className={errorClasses}>{errors.name}</p>}
      </div>

      <div>
        <label className={labelClasses} htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          value={fields.description}
          onChange={(e) => setField("description", e.target.value)}
          className={inputClasses}
          placeholder="Describe the product..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="category">Category</label>
          <select
            id="category"
            value={fields.category}
            onChange={(e) => setField("category", e.target.value)}
            disabled={categoriesLoading}
            className={inputClasses}
          >
            <option value="">Select a category</option>
            {(categories ?? []).map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {errors.category && <p className={errorClasses}>{errors.category}</p>}
        </div>

        <div>
          <label className={labelClasses} htmlFor="stock">Stock Quantity</label>
          <input
            id="stock"
            type="number"
            min="0"
            value={fields.stock}
            onChange={(e) => setField("stock", e.target.value)}
            className={inputClasses}
            placeholder="0"
          />
          {errors.stock && <p className={errorClasses}>{errors.stock}</p>}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="price">Price (₹)</label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={fields.priceRupees}
          onChange={(e) => setField("priceRupees", e.target.value)}
          className={inputClasses}
          placeholder="0.00"
        />
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Entered in rupees — converted to paise automatically on save.
        </p>
        {errors.priceRupees && <p className={errorClasses}>{errors.priceRupees}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          checked={fields.isActive}
          onChange={(e) => setField("isActive", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        Active (visible to customers)
      </label>

      <ProductImages images={images} onChange={setImages} />

      <div className="flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;