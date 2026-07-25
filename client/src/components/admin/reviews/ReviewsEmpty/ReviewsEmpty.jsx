import { MessageSquareQuote } from "lucide-react";

export const ReviewsEmpty = ({ hasFilters = false, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="rounded-full bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
        <MessageSquareQuote className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
          {hasFilters ? "No reviews match your filters" : "No reviews found"}
        </h2>
        <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
          {hasFilters
            ? "Try clearing search or filter values to see more reviews."
            : "When customers leave reviews, they will appear here for moderation."}
        </p>
      </div>
      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
};

export default ReviewsEmpty;
