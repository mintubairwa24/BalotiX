/**
 * src/pages/ErrorPage.jsx
 *
 * PURPOSE:
 *   Catch-all fallback page rendered for any unmatched route.
 *   Registered as the wildcard "*" route in src/routes/AppRoutes.jsx.
 */

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4">
        <p className="text-6xl font-bold text-indigo-600">404</p>
        <h2 className="text-2xl font-bold text-gray-900">Page not found</h2>
        <p className="text-gray-500">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Go to Homepage
        </a>
      </div>
    </div>
  );
}