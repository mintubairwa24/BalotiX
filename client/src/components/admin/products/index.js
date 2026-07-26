// FILE: src/components/admin/products/index.js
/**
 * Top-level barrel for src/components/admin/products/*
 * Lets consumers write: import { ProductsTable, ProductForm } from "../components/admin/products";
 * Consistent with every other feature folder's aggregation barrel in this project.
 */
export { ProductsTable } from "./ProductsTable/ProductsTable";
export { ProductRow } from "./ProductRow/ProductRow";
export { ProductForm } from "./ProductForm/ProductForm";
export { ProductImages } from "./ProductImages/ProductImages";
export { ProductStatus } from "./ProductStatus/ProductStatus";
export { ProductFilters } from "./ProductFilters/ProductFilters";
export { ProductSearch } from "./ProductSearch/ProductSearch";
export { ProductActions } from "./ProductActions/ProductActions";
export { DeleteProductModal } from "./DeleteProductModal/DeleteProductModal";
export { ProductsPagination } from "./ProductsPagination/ProductsPagination";
export { ProductsEmpty } from "./ProductsEmpty/ProductsEmpty";
export { ProductsSkeleton } from "./ProductsSkeleton/ProductsSkeleton";