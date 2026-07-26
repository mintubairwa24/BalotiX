/**
 * src/pages/shop/ProductDetailsPage.jsx
 *
 * PURPOSE:
 *   The product detail page at /products/:slug.
 *   Composes ProductGallery (left column), ProductInfo (right column),
 *   and RelatedProducts (below) into the complete detail experience.
 *
 * HOW IT CONNECTS TO THE BACKEND:
 *   Uses useProduct(slug) hook → getProductBySlug(slug) → GET /products/slug/:slug
 *   The backend returns the full product object with categoryId populated
 *   (name, slug) — this is used for:
 *   - Breadcrumb: Home > Category > Product Name
 *   - RelatedProducts: fetch products with same categoryId
 *
 * URL PATTERN:
 *   /products/iphone-15-pro → slug = "iphone-15-pro"
 *   useParams() extracts the slug from the React Router URL param.
 *
 * LOADING STATES:
 *   isLoading → renders ProductSkeleton variant="detail" — a full two-column
 *               layout skeleton that matches the real page perfectly.
 *   isNotFound → renders a styled "Product not found" message with links
 *                to browse other products.
 *   isError    → renders a generic error with retry button.
 *
 * SCROLL BEHAVIOUR:
 *   CustomerLayout renders ScrollToTop which resets scroll to (0,0) on
 *   every route change — so navigating from one product to another always
 *   starts at the top. No work needed here.
 *
 * SEO NOTE (future):
 *   Phase 8 — add react-helmet or Vite plugin for <title> and <meta>
 *   tags using product.name and product.description.
 *   This component already has access to both fields.
 *
 * FUTURE PHASES:
 *   Phase 7 (Cart) — ProductInfo's Add to Cart button becomes a real mutation.
 *   Phase 7 (Wishlist) — ProductInfo's wishlist button becomes real mutation.
 *   Phase 8 (Reviews) — add a ReviewsSection below RelatedProducts.
 */

import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PackageSearch, Home, ArrowLeft } from "lucide-react";

import { useProduct } from "../../hooks/useProduct";
import { ProductGallery } from "../../product/ProductGallery/ProductGallery";
import { ProductInfo } from "../../product/ProductInfo/ProductInfo";
import { RelatedProducts } from "../../product/RelatedProducts/RelatedProducts";
import { ProductSkeleton } from "../../product/ProductSkeleton/ProductSkeleton";
import { Breadcrumb } from "../../components/common/Breadcrumb/Breadcrumb";
import { ROUTES } from "../../constants/route.constants";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const { product, isLoading, isError, isNotFound } = useProduct(slug);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 mb-8">
          {[40, 60, 80].map((w) => (
            <div
              key={w}
              className={`h-3 w-${w} rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse`}
            />
          ))}
        </div>
        <ProductSkeleton variant="detail" />
      </div>
    );
  }

  // ── 404 — product not found ────────────────────────────────────────────────
  if (isNotFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto mb-6">
            <PackageSearch size={36} className="text-indigo-400" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Product not found
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            The product you're looking for doesn't exist or may have been removed.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to={ROUTES.PRODUCTS}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
            >
              Browse Products
            </Link>
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <Home size={14} aria-hidden="true" />
              Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Generic error state ────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Something went wrong loading this product.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Build breadcrumb from populated categoryId ─────────────────────────────
  const breadcrumbItems = [
    { label: "Products", path: ROUTES.PRODUCTS },
    ...(product?.categoryId?.name
      ? [
          {
            label: product.categoryId.name,
            path: `${ROUTES.PRODUCTS}?categoryId=${product.categoryId._id}`,
          },
        ]
      : []),
    { label: product?.name ?? "" },
  ];

  // ── Product detail render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to={ROUTES.PRODUCTS}
            className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors lg:hidden"
            aria-label="Back to products"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back
          </Link>
          <div className="hidden lg:block">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* ── Two-column product layout ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-2 gap-8 lg:gap-14"
        >
          {/* Left — gallery */}
          <ProductGallery
            images={product?.images ?? []}
            thumbnail={product?.thumbnail}
            productName={product?.name}
          />

          {/* Right — info + purchase controls */}
          <ProductInfo product={product} />
        </motion.div>

        {/* ── Related products ─────────────────────────────────────── */}
        {/*
          Only render RelatedProducts when we have a valid categoryId.
          The component handles its own loading and empty states internally.
        */}
        {product?.categoryId?._id && (
          <RelatedProducts
            currentProductId={product._id}
            categoryId={product.categoryId._id}
            categoryName={product.categoryId.name}
          />
        )}
      </div>
    </div>
  );
}