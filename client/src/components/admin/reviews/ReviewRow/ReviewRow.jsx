import { Link } from "react-router-dom";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { ReviewStars } from "../ReviewStars/ReviewStars";
import { ReviewStatusBadge } from "../ReviewStatusBadge/ReviewStatusBadge";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const ReviewRow = ({
  review,
  onHide,
  onRestore,
  onDelete,
  isHidePending,
  isRestorePending,
  isDeletePending,
}) => {
  const reviewer = review.userId;
  const product = review.productId;
  const status = review.moderationStatus ?? "unknown";
  const canHide = status === "published";
  const canRestore = status !== "published";

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
      <td className="p-3 align-top">
        <div className="space-y-1">
          <Link
            to={`/admin/reviews/${review._id}`}
            className="font-medium text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-300"
          >
            {review.title || "Untitled review"}
          </Link>
          <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
            {review.comment}
          </p>
        </div>
      </td>
      <td className="p-3 align-top">
        <div className="space-y-1">
          <ReviewStars rating={review.rating} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {review.rating}/5
          </p>
        </div>
      </td>
      <td className="p-3 align-top text-sm text-gray-700 dark:text-gray-300">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {reviewer?.name || "Unknown reviewer"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {reviewer?.email || "No email"}
        </p>
      </td>
      <td className="p-3 align-top text-sm text-gray-700 dark:text-gray-300">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {product?.name || "Unknown product"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {product?.slug ? `/products/${product.slug}` : "No slug"}
        </p>
      </td>
      <td className="p-3 align-top">
        <ReviewStatusBadge status={status} />
      </td>
      <td className="p-3 align-top text-sm text-gray-700 dark:text-gray-300">
        {formatDate(review.createdAt)}
      </td>
      <td className="p-3 align-top">
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/reviews/${review._id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
          </Link>
          {canHide && (
            <button
              type="button"
              onClick={() => onHide(review._id)}
              disabled={isHidePending}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Hide
            </button>
          )}
          {canRestore && (
            <button
              type="button"
              onClick={() => onRestore(review._id)}
              disabled={isRestorePending}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <Eye className="h-3.5 w-3.5" />
              Restore
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(review._id)}
            disabled={isDeletePending}
            className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ReviewRow;
