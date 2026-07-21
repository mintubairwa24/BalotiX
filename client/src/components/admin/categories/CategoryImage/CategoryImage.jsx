/**
 * FILE: src/components/admin/categories/CategoryImage/CategoryImage.jsx
 *
 * ============================================================================
 * CategoryImage — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A controlled SINGLE-image manager for CategoryForm — a category has one
 * representative image, unlike a product's multi-image gallery. This is a
 * simplified sibling of ProductImages (Phase 18A): same preview/replace/
 * remove mechanics, capped at exactly one image instead of up to six.
 *
 * WHY NOT REUSE ProductImages DIRECTLY:
 * ProductImages' entire internal model is an ARRAY of images with add/
 * remove-by-id semantics. Forcing a single-image use case through that API
 * would mean either passing a one-item array everywhere (leaking the
 * multi-image mental model into category code) or adding an `isSingle`
 * branch inside ProductImages that couples two features together for a
 * component that's actually simpler as its own file. A small sibling
 * keeps both components easy to reason about independently.
 *
 * WHERE THE ACTUAL UPLOAD HAPPENS (same design decision as ProductImages):
 * This component does NOT call Cloudinary directly — it only tracks the
 * current image as either an existing URL (edit mode) or a new File
 * (replace/create). CategoryForm appends whichever is present to the
 * FormData sent to POST/PUT /categories, and the backend is assumed to
 * own the actual Cloudinary upload server-side, same as product images.
 *
 * CONTROLLED COMPONENT SHAPE:
 * `image`: { url, file? } | null — `file` present only for a newly-picked
 * image not yet uploaded; `url` is either a real Cloudinary URL (existing)
 * or a local blob preview URL (new).
 * `onChange(nextImage)`: called on select/remove — CategoryForm owns the
 * actual state.
 *
 * VALIDATION (client-side, pre-flight only — backend remains authoritative):
 * image/* MIME types only, 5MB cap — same guardrail values as ProductImages
 * for consistency across the admin.
 *
 * PRODUCTION-READY BECAUSE:
 * - Object URL for the preview is revoked on replace/remove/unmount to
 *   avoid memory leaks
 * - Drag-and-drop AND click-to-browse both supported
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useEffect, useRef, useState } from "react";
import { UploadCloud, X, ImagePlus } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;

const CategoryImage = ({ image, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    // Cleanup function to revoke the object URL and prevent memory leaks
    return () => {
      if (image?.file) URL.revokeObjectURL(image.url);
    };
    // Rerun when the image object changes to handle new previews
  }, [image]);

  const handleFile = (file) => {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (image?.file) URL.revokeObjectURL(image.url);
    onChange({ url: URL.createObjectURL(file), file });
  };

  const handleRemove = () => {
    if (image?.file) URL.revokeObjectURL(image.url);
    onChange(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Category Image
      </label>

      {image ? (
        <div className="group relative h-32 w-32 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <img src={image.url} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove image"
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-gray-400 transition ${
            dragActive
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
              : "border-gray-300 hover:border-gray-400 dark:border-gray-600"
          }`}
        >
          {dragActive ? (
            <UploadCloud className="h-6 w-6" />
          ) : (
            <ImagePlus className="h-6 w-6" />
          )}
          <span className="text-[11px]">Add image</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
          e.target.value = "";
        }}
      />

      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        One image, up to {MAX_FILE_SIZE_MB}MB.
      </p>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default CategoryImage;