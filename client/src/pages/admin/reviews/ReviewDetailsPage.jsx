import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, EyeOff, Pencil, Trash2, ShieldCheck, Star } from "lucide-react";
import { useAuthStore } from "../../../store";
import {
  useAdminReviewDetail,
  useDeleteAdminReview,
  useHideAdminReview,
  useRestoreAdminReview,
} from "../../../hooks/useAdminReviews";
import { ReviewStars } from "../../../components/admin/reviews/ReviewStars/ReviewStars";
import { ReviewStatusBadge } from "../../../components/admin/reviews/ReviewStatusBadge/ReviewStatusBadge";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const ReviewDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  const { review, isLoading, isError, error } = useAdminReviewDetail(id);
  const hideMutation = useHideAdminReview();
  const restoreMutation = useRestoreAdminReview();
  const deleteMutation = useDeleteAdminReview();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      setBlocked(true);
      const timer = setTimeout(() => navigate("/", { replace: true }), 1800);
      return () => clearTimeout(timer);
    }
  }, [isAuthLoading, user, isAdmin, navigate]);

  if (isAuthLoading) return null;

  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting...
      </div>
    );
  }

  if (!isAdmin) return null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-3">
            <div className="h-6 w-64 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-full rounded bg-gray-100 dark:bg-gray-700" />
            <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/reviews"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Reviews
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error?.message ?? "Unable to load this review."}
        </div>
      </div>
    );
  }

  const reviewer = review.userId;
  const product = review.productId;
  const canHide = review.moderationStatus === "published";
  const canRestore = review.moderationStatus !== "published";

  const handleHide = () => {
    if (!window.confirm("Hide this review from the storefront?")) return;
    hideMutation.mutate(review._id);
  };

  const handleRestore = () => {
    if (!window.confirm("Restore this review to the storefront?")) return;
    restoreMutation.mutate(review._id);
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this review permanently? This cannot be undone.")) return;
    deleteMutation.mutate(review._id, {
      onSuccess: () => navigate("/admin/reviews"),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/admin/reviews"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Reviews
        </Link>
        <div className="flex flex-wrap gap-2">
          {canHide && (
            <button
              type="button"
              onClick={handleHide}
              disabled={hideMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <EyeOff className="h-4 w-4" />
              Hide
            </button>
          )}
          {canRestore && (
            <button
              type="button"
              onClick={handleRestore}
              disabled={restoreMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <ShieldCheck className="h-4 w-4" />
              Restore
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ReviewStatusBadge status={review.moderationStatus} />
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Verified purchase
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {review.title || "Untitled review"}
              </h1>
              <div className="flex items-center gap-3">
                <ReviewStars rating={review.rating} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {review.rating}/5
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Created {formatDateTime(review.createdAt)}</p>
              <p>Updated {formatDateTime(review.updatedAt)}</p>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-900/60 dark:text-gray-200">
            {review.comment}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Reviewer
            </h2>
            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-50">
                {reviewer?.name || "Unknown reviewer"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {reviewer?.email || "No email available"}
              </p>
            </div>
            {reviewer?._id && (
              <Link
                to={`/admin/users/${reviewer._id}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
                Open user
              </Link>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Product
            </h2>
            <div className="space-y-1">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-50">
                {product?.name || "Unknown product"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {product?.slug ? `/products/${product.slug}` : "No slug available"}
              </p>
            </div>
            {product?._id && (
              <Link
                to={`/admin/products/${product._id}/edit`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Pencil className="h-4 w-4" />
                Open product
              </Link>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Metadata
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Review ID</dt>
                <dd className="text-right font-mono text-gray-700 dark:text-gray-200">{review._id}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Order ID</dt>
                <dd className="text-right font-mono text-gray-700 dark:text-gray-200">
                  {review.orderId || "—"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-gray-500 dark:text-gray-400">Moderation</dt>
                <dd>
                  <ReviewStatusBadge status={review.moderationStatus} />
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default ReviewDetailsPage;
