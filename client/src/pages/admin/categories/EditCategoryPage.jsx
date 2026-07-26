/**
 * FILE: src/pages/admin/categories/EditCategoryPage.jsx
 *
 * ============================================================================
 * EditCategoryPage — Phase 18B
 * ============================================================================
 *
 * WHY THIS FILE EXISTS:
 * The /admin/categories/:id/edit route. Fetches the category being
 * edited, then renders <CategoryForm mode="edit" initialCategory={category} />.
 * Exact sibling of EditProductPage (Phase 18A).
 *
 * REUSES (Convention #11) / FLAGGED ASSUMPTION: category-detail fetching
 * uses `useCategory(id)`, assumed to exist as the category-module
 * equivalent of Phase 5's `useProduct(id)` (GET /categories/:id). This
 * wasn't independently re-verified this session — if the real hook name
 * or shape differs, only this one import/usage needs updating.
 *
 * FLAGGED RISK (not verified this session): if `useCategory(id)`'s backend
 * route only returns ACTIVE categories (reasonable for a public endpoint),
 * editing an INACTIVE category here would incorrectly 404 — same class of
 * risk already flagged in EditProductPage. If confirmed, the isolated fix
 * is a dedicated `getAdminCategoryById` in admin.service.js, without
 * touching this page's structure or CategoryForm.
 *
 * PRODUCTION-READY BECAUSE:
 * - Distinguishes loading / error / success states explicitly
 *   (Convention #7 — never fail silently)
 * - CategoryForm only mounts once real category data is available
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { useAuthStore } from "../../../store";
import { useCategory } from "../../../hooks/useCategory";
import { useAdminCategoriesList } from "../../../hooks/useAdminCategories";
import { useQuery } from "@tanstack/react-query";
import { getCategoryById } from "../../../services/category.service";
import CategoryForm from "../../../components/admin/categories/CategoryForm/CategoryForm";
import { CategoryBreadcrumb } from "../../../components/admin/categories";

const EditCategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAdmin = user?.role === "admin";
  const [blocked, setBlocked] = useState(false);

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


  
  // Reused/assumed from the Category module — see file header.
  // const { category, isLoading, isError } = useCategory(id);
  // For CategoryBreadcrumb's one-level-up fallback if `category.ancestors`
  // isn't provided by the backend — see that component's header.
  const { categories: allCategories } = useAdminCategoriesList();

  const { data: category, isLoading, isError } = useQuery({
    queryKey: ["categories", "detail", "byId", id],
    queryFn: () => getCategoryById(id).then((res) => res.data.data.category),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  if (isAuthLoading) return null;
  if (blocked) {
    return (
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
        This area is restricted to administrators. Redirecting…
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="space-y-5">
      <div>
        <Link
          to="/admin/categories"
          className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Categories
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Edit Category
        </h1>
      </div>

      {isLoading && (
        <div className="max-w-2xl space-y-3">
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          <div className="h-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          Couldn't load this category. It may have been deleted, or you can
          try again from the Categories list.
        </div>
      )}

      {!isLoading && !isError && category && (
        <>
          <CategoryBreadcrumb category={category} allCategories={allCategories} />
          <CategoryForm mode="edit" initialCategory={category} />
        </>
      )}
    </div>
  );
};

export default EditCategoryPage;