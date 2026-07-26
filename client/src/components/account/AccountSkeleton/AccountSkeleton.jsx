/**
 * src/components/account/AccountSkeleton/AccountSkeleton.jsx
 * 
 * ARCHITECTURAL PURPOSE:
 * Loading skeleton for account pages, supporting two variants like
 * OrderSkeleton (Phase 14):
 * - "card": a single profile-card-shaped skeleton (avatar + name/email
 *   lines) — used by ProfilePage, AccountOverview
 * - "form": a form-shaped skeleton (label + input rows) — used by
 *   EditProfilePage while the profile loads before prefilling
 * 
 * Same layout-shift-prevention principle as every prior *Skeleton
 * component in NexCart (CartSkeleton, AddressSkeleton, OrderSkeleton).
 * 
 * Props:
 * - variant: "card" | "form" (default "card")
 */

export const AccountSkeleton = ({ variant = "card" }) => {
  if (variant === "form") {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-full" />
          </div>
        ))}
        <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded-lg w-32" />
      </div>
    );
  }

  // variant === "card"
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-40" />
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-56" />
      </div>
    </div>
  );
};