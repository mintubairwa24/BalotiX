/**
 * COMPONENT: src/components/admin/orders/OrdersSkeleton/OrdersSkeleton.jsx
 *
 * PURPOSE:
 * Loading placeholder for the orders table. Renders rows with shimmer
 * animation while data is being fetched.
 */

export const OrdersSkeleton = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} className="p-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default OrdersSkeleton;

