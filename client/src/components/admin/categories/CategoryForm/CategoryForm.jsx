/**
 * FILE: src/components/admin/categories/CategoryForm/CategoryForm.jsx
 *
 * ============================================================================
 * CategoryForm — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * One shared form component powering BOTH CreateCategoryPage and
 * EditCategoryPage. The only difference between "create" and "edit" is
 * whether `initialCategory` is provided and which mutation hook fires.
 *
 * BACKEND COMMUNICATION:
 * On submit, builds a FormData with name/description/status/parentId/
 * image, then calls either useCreateCategory() or useUpdateCategory().
 * Field names match the backend schema exactly (parentId, status).
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useCategories } from "../../../../hooks/useCategories";
import {
  useCreateCategory,
  useUpdateCategory,
} from "../../../../hooks/useAdminCategories";
import CategoryImage from "../CategoryImage/CategoryImage";
import  ParentCategorySelector  from "../ParentCategorySelector/ParentCategorySelector";

export const CategoryForm = ({ mode, initialCategory }) => {
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const { mutate: createCategoryMutation, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategoryMutation, isPending: isUpdating } = useUpdateCategory();
  const isSubmitting = isCreating || isUpdating;

  // Backend uses `parentId` (ObjectId ref) and `status` string
  const [fields, setFields] = useState({
    name: initialCategory?.name ?? "",
    description: initialCategory?.description ?? "",
    parentId: initialCategory?.parentId?._id ?? initialCategory?.parentId ?? "",
    status: initialCategory?.status ?? "active",
  });
  const [image, setImage] = useState(
    initialCategory?.image ? { url: initialCategory.image, file: undefined } : null
  );
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const setField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!fields.name.trim()) nextErrors.name = "Category name is required.";
    if (
      mode === "edit" &&
      fields.parentId &&
      fields.parentId === initialCategory._id
    ) {
      nextErrors.parentId = "A category cannot be its own parent.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", fields.name.trim());
    formData.append("description", fields.description.trim());
    formData.append("parentId", fields.parentId || "");
    formData.append("status", fields.status);

    if (image?.file) {
      formData.append("image", image.file);
    } else if (image?.url) {
      formData.append("existingImage", image.url);
    } else {
      formData.append("existingImage", "");
    }

    return formData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const formData = buildFormData();
    const onSuccess = () => navigate("/admin/categories");
    const onError = (err) => {
      setSubmitError(
        err?.response?.data?.message ?? "Something went wrong saving this category."
      );
    };

    if (mode === "create") {
      createCategoryMutation(formData, { onSuccess, onError });
    } else {
      updateCategoryMutation(
        { id: initialCategory._id, formData },
        { onSuccess, onError }
      );
    }
  };

  // Editing: exclude the category itself from its own parent options.
  const parentOptions = (categories ?? []).filter(
    (cat) => !(mode === "edit" && cat._id === initialCategory._id)
  );

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
        <label className={labelClasses} htmlFor="name">Category Name</label>
        <input
          id="name"
          type="text"
          value={fields.name}
          onChange={(e) => setField("name", e.target.value)}
          className={inputClasses}
          placeholder="e.g. Wireless Headphones"
        />
        {errors.name && <p className={errorClasses}>{errors.name}</p>}
      </div>

      <div>
        <label className={labelClasses} htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={3}
          value={fields.description}
          onChange={(e) => setField("description", e.target.value)}
          className={inputClasses}
          placeholder="Describe this category..."
        />
      </div>

      <div>
        <label className={labelClasses} htmlFor="parentId">Parent Category</label>
        <select
          id="parentId"
          value={fields.parentId}
          onChange={(e) => setField("parentId", e.target.value)}
          disabled={categoriesLoading}
          className={inputClasses}
        >
          <option value="">None (top-level category)</option>
          {parentOptions.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        {errors.parentId && <p className={errorClasses}>{errors.parentId}</p>}
      </div>

      <div>
        <label className={labelClasses} htmlFor="status">Status</label>
        <select
          id="status"
          value={fields.status}
          onChange={(e) => setField("status", e.target.value)}
          className={inputClasses}
        >
          <option value="active">Active (visible to customers)</option>
          <option value="inactive">Inactive (hidden from customers)</option>
        </select>
      </div>

      <CategoryImage image={image} onChange={setImage} />

      <div className="flex items-center gap-3 border-t border-gray-100 pt-5 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Category" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/admin/categories")}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;