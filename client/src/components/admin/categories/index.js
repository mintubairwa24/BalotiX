// FILE: src/components/admin/categories/index.js
/**
 * Top-level barrel for src/components/admin/categories/*
 * Lets consumers write: import { CategoriesTable, CategoryForm } from "../components/admin/categories";
 * Consistent with every other feature folder's aggregation barrel in this project.
 */
export { CategoriesTable } from "./CategoriesTable/CategoriesTable";
export { CategoryRow } from "./CategoryRow/CategoryRow";
export { CategoryForm } from "./CategoryForm/CategoryForm";
export { CategoryImage } from "./CategoryImage/CategoryImage";
export { CategoryStatus } from "./CategoryStatus/CategoryStatus";
export { CategoryFilters } from "./CategoryFilters/CategoryFilters";
export { CategorySearch } from "./CategorySearch/CategorySearch";
export { CategoryActions } from "./CategoryActions/CategoryActions";
export { DeleteCategoryModal } from "./DeleteCategoryModal/DeleteCategoryModal";
export { CategoriesPagination } from "./CategoriesPagination/CategoriesPagination";
export { CategoriesEmpty } from "./CategoriesEmpty/CategoriesEmpty";
export { CategoriesSkeleton } from "./CategoriesSkeleton/CategoriesSkeleton";