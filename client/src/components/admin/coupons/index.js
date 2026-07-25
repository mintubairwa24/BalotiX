// FILE: src/components/admin/coupons/index.js
/**
 * Top-level barrel for src/components/admin/coupons/*
 * Lets consumers write: import { CouponsTable, CouponForm } from "../components/admin/coupons";
 * Consistent with every other feature folder's aggregation barrel in this project.
 */
export { CouponsTable } from "./CouponsTable/CouponsTable";
export { CouponRow } from "./CouponRow/CouponRow";
export { CouponForm } from "./CouponForm/CouponForm";
export { CouponStatus } from "./CouponStatus/CouponStatus";
export { CouponFilters } from "./CouponFilters/CouponFilters";
export { CouponSearch } from "./CouponSearch/CouponSearch";
export { CouponActions } from "./CouponActions/CouponActions";
export { CouponUsage } from "./CouponUsage/CouponUsage";
export { DeleteCouponModal } from "./DeleteCouponModal/DeleteCouponModal";
export { CouponsPagination } from "./CouponsPagination/CouponsPagination";
export { CouponsEmpty } from "./CouponsEmpty/CouponsEmpty";
export { CouponsSkeleton } from "./CouponsSkeleton/CouponsSkeleton";