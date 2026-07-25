import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareText, Search } from "lucide-react";
import { useAuthStore } from "../../../store";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useAdminReviewsList,
  useDeleteAdminReview,
  useHideAdminReview,
  useRestoreAdminReview,
} from "../../../hooks/useAdminReviews";
import { ReviewsTable } from "../../../components/admin/reviews/ReviewsTable/ReviewsTable";

const DEFAULT_LIMIT = 10;

const ReviewsPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

  const [search, setSearch] = useState("");
  const [moderationStatus, setModerationStatus] = useState("all");
  const [rating, setRating] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

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

  const queryParams = {
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch || undefined,
    moderationStatus,
    rating: rating === "all" ? undefined : Number(rating),
    sortBy,
    sortOrder,
  };

  const { reviews, pagination, isLoading, isError, error, refetch } =
    useAdminReviewsList(queryParams);
  const hideMutation = useHideAdminReview();
  const restoreMutation = useRestoreAdminReview();
  const deleteMutation = useDeleteAdminReview();

  const hasFilters = Boolean(
    search || moderationStatus !== "all" || rating !== "all" || sortBy !== "createdAt" || sortOrder !== "desc"
  );

  const resetFilters = () => {
    setSearch("");
    setModerationStatus("all");
    setRating("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const handleHide = (reviewId) => {
    if (!window.confirm("Hide this review from the storefront?")) return;
    hideMutation.mutate(reviewId);
  };

  const handleRestore = (reviewId) => {
    if (!window.confirm("Restore this review to the storefront?")) return;
    restoreMutation.mutate(reviewId);
  };

  const handleDelete = (reviewId) => {
    if (!window.confirm("Delete this review permanently? This cannot be undone.")) return;
    deleteMutation.mutate(reviewId);
  };

  if (isAuthLoading) return null;

  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <MessageSquareText className="h-3.5 w-3.5" />
            Phase 18G
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
            Reviews
          </h1>
          <p className="max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Search, sort, filter, and moderate product reviews using backend data.
          </p>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {pagination?.totalCount != null && (
            <span>
              {pagination.totalCount.toLocaleString("en-IN")} reviews found
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:grid-cols-5">
        <label className="lg:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Search
          </span>
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-900">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search review title, comment, reviewer, or product"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-100"
            />
          </div>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Status
          </span>
          <select
            value={moderationStatus}
            onChange={(event) => {
              setModerationStatus(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="removed">Removed</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Rating
          </span>
          <select
            value={rating}
            onChange={(event) => {
              setRating(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          >
            <option value="all">All</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Sort
          </span>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="createdAt">Created</option>
              <option value="rating">Rating</option>
            </select>
            <select
              value={sortOrder}
              onChange={(event) => {
                setSortOrder(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </label>

        <div className="lg:col-span-5">
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Reset filters
          </button>
        </div>
      </div>

      <ReviewsTable
        reviews={reviews}
        pagination={pagination}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(nextSortBy, nextSortOrder) => {
          setSortBy(nextSortBy);
          setSortOrder(nextSortOrder);
          setPage(1);
        }}
        onPageChange={setPage}
        onHide={handleHide}
        onRestore={handleRestore}
        onDelete={handleDelete}
        hidePending={hideMutation.isPending}
        restorePending={restoreMutation.isPending}
        deletePending={deleteMutation.isPending}
        hasFilters={hasFilters}
        onResetFilters={resetFilters}
      />
    </div>
  );
};

export default ReviewsPage;
