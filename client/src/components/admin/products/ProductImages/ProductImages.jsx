/**
 * FILE: src/components/admin/products/ProductImages/ProductImages.jsx
 *
 * ============================================================================
 * ProductImages — Phase 18A
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * A controlled multi-image manager for ProductForm: shows existing product
 * images (edit mode), lets the admin pick new files, previews everything in
 * one grid, and lets each image be individually removed before submit.
 *
 * WHERE THE ACTUAL CLOUDINARY UPLOAD HAPPENS (design decision, flagged):
 * This component does NOT call Cloudinary directly. Per product.service.js's
 * documented assumption, createProduct/updateProduct send images as
 * multipart/form-data straight to the backend, which — consistent with
 * keeping business logic and third-party integrations out of the frontend
 * (this project's core architectural principle) — is assumed to own the
 * actual Cloudinary upload server-side (multer + cloudinary storage). So
 * ProductImages' only job is collecting File objects + tracking which
 * existing image URLs should be kept vs. removed; ProductForm is
 * responsible for appending them to FormData on submit.
 * ALTERNATE CONTRACT: if your backend instead expects the frontend to
 * upload directly to Cloudinary's unsigned upload endpoint and submit back
 * URLs as JSON, only this component's `onFilesSelected` handler changes
 * (swap local File-object tracking for an async upload-then-store-URL
 * step) — ProductForm's prop contract with this component stays identical.
 *
 * CONTROLLED COMPONENT SHAPE:
 * `images`: array of { id, url, file? } — `file` present only for
 * newly-added images (not yet uploaded); `url` is either a real Cloudinary
 * URL (existing image) or a local blob preview URL (new image, via
 * `URL.createObjectURL`).
 * `onChange(nextImages)`: called on add/remove — ProductForm owns the
 * actual state, this component is "dumb."
 *
 * VALIDATION (client-side, pre-flight only — backend remains authoritative):
 * - Max 6 images total, image/* MIME types only, 5MB per file cap.
 * - These are UX guardrails to avoid an obviously-doomed upload, not a
 *   substitute for backend validation (Convention: backend Zod validation
 *   already covers the source of truth for what's acceptable).
 *
 * PRODUCTION-READY BECAUSE:
 * - Object URLs created for previews are revoked on removal/unmount to
 *   avoid memory leaks
 * - Drag-and-drop AND click-to-browse both supported
 * - Dark mode via `dark:` classes (Convention #6)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, X, ImagePlus } from "lucide-react";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_MB = 5;

const ProductImages = ({ images, onChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Revoke any blob: preview URLs on unmount to avoid leaking memory.
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.file) URL.revokeObjectURL(img.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback(
    (fileList) => {
      setError("");
      const incoming = Array.from(fileList);
      const remainingSlots = MAX_IMAGES - images.length;

      if (remainingSlots <= 0) {
        setError(`You can upload up to ${MAX_IMAGES} images.`);
        return;
      }

      const accepted = [];
      for (const file of incoming.slice(0, remainingSlots)) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed.");
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setError(`Each image must be under ${MAX_FILE_SIZE_MB}MB.`);
          continue;
        }
        accepted.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          url: URL.createObjectURL(file),
          file,
        });
      }

      if (accepted.length > 0) {
        onChange([...images, ...accepted]);
      }
    },
    [images, onChange]
  );

  const handleRemove = (id) => {
    const target = images.find((img) => img.id === id);
    if (target?.file) URL.revokeObjectURL(target.url);
    onChange(images.filter((img) => img.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Product Images
      </label>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img.id)}
              aria-label="Remove image"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-gray-400 transition ${
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
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = ""; // allow re-selecting the same file later
        }}
      />

      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Up to {MAX_IMAGES} images, {MAX_FILE_SIZE_MB}MB each.
      </p>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ProductImages;