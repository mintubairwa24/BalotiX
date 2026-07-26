export const ReviewStatusBadge = ({ status }) => {
  const isPublished = status === "published";
  const classes = isPublished
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
    : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${classes}`}>
      {status || "unknown"}
    </span>
  );
};

export default ReviewStatusBadge;
