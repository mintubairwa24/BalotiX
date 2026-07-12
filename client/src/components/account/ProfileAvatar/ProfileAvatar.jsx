/**
 * src/components/account/ProfileAvatar/ProfileAvatar.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Displays the user's avatar — either their uploaded image or a
 * generated initials fallback (so the UI never shows a broken/empty
 * image state). Optionally shows an upload control.
 * 
 * WHY UPLOAD IS CONDITIONAL (`editable` PROP), NOT ALWAYS-ON:
 * Per this phase's instructions ("Profile picture if backend supports
 * it"), avatar upload is an OPTIONAL backend feature. This component
 * itself doesn't know whether your backend implements POST
 * /users/avatar — the PARENT decides by passing `editable={true}` only
 * where upload should be offered (e.g. EditProfilePage) and
 * `editable={false}` for pure display contexts (e.g. AccountSidebar).
 * If your backend has NO avatar endpoint at all, simply never pass
 * `editable={true}` anywhere — the component still works perfectly as
 * a read-only avatar display, and useUploadAvatar()/uploadAvatar()
 * (this phase's hook/service) simply go unused rather than needing to
 * be deleted.
 * 
 * INITIALS FALLBACK:
 * Generated client-side from the user's name (first letters of first
 * two words) — purely presentational derivation, not a backend value,
 * so it works instantly even before any avatarUrl exists.
 * 
 * Props:
 * - name: string - used for initials fallback and alt text
 * - avatarUrl: string|null - uploaded image URL from profile
 * - size: "sm" | "md" | "lg" (default "md")
 * - editable: boolean - show upload control (default false)
 */

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useUploadAvatar } from "../../../hooks/useAccount";
import { useAccountStore } from "../../../store/account.store";

const SIZE_CLASSES = {
  sm: "w-10 h-10 text-sm",
  md: "w-16 h-16 text-lg",
  lg: "w-24 h-24 text-2xl",
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase());
  return initials.join("") || "?";
};

export const ProfileAvatar = ({
  name,
  avatarUrl,
  size = "md",
  editable = false,
}) => {
  const fileInputRef = useRef(null);
  const { avatarPreviewUrl, setAvatarPreviewUrl, clearAvatarPreviewUrl } =
    useAccountStore();

  const { mutate: uploadAvatar, isPending } = useUploadAvatar({
    onSuccess: () => clearAvatarPreviewUrl(),
    onError: () => clearAvatarPreviewUrl(),
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show an instant local preview while the upload is in flight
    setAvatarPreviewUrl(URL.createObjectURL(file));
    uploadAvatar(file);
  };

  const displayUrl = avatarPreviewUrl || avatarUrl;
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClass} rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-semibold shrink-0`}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={name || "User avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}

        {isPending && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 size={18} className="animate-spin text-white" />
          </div>
        )}
      </div>

      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            title="Change profile picture"
          >
            <Camera size={12} className="text-gray-700 dark:text-gray-300" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  );
};