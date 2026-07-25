export const ReviewsSkeleton = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
          <td className="p-3">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-3 w-64 rounded bg-gray-100 dark:bg-gray-700/70" />
            </div>
          </td>
          <td className="p-3">
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="p-3">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="p-3">
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="p-3">
            <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="p-3">
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          </td>
          <td className="p-3">
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default ReviewsSkeleton;
