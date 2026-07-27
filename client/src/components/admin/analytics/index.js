// FILE: src/components/admin/analytics/index.js
/**
 * Top-level barrel for src/components/admin/analytics/*
 * Lets consumers write: import { DashboardCards, SalesChart } from "../components/admin/analytics";
 * Consistent with every other feature folder's aggregation barrel in this project.
 */
export { DashboardCards } from "./DashboardCards/DashboardCards";
export { RevenueCard } from "./RevenueCard/RevenueCard";
export { SalesChart } from "./SalesChart/SalesChart";
export { OrdersChart } from "./OrdersChart/OrdersChart";
export { CustomerGrowthChart } from "./CustomerGrowthChart/CustomerGrowthChart";
export { TopProducts } from "./TopProducts/TopProducts";
export { TopCategories } from "./TopCategories/TopCategories";
export { InventoryInsights } from "./InventoryInsights/InventoryInsights";
export { CouponAnalytics } from "./CouponAnalytics/CouponAnalytics";
export { PaymentAnalytics } from "./PaymentAnalytics/PaymentAnalytics";
export { ReviewAnalytics } from "./ReviewAnalytics/ReviewAnalytics";
export { RecentActivity } from "./RecentActivity/RecentActivity";
export { DateRangeFilter } from "./DateRangeFilter/DateRangeFilter";
export { AnalyticsFilters } from "./AnalyticsFilters/AnalyticsFilters";
export { AnalyticsSkeleton } from "./AnalyticsSkeleton/AnalyticsSkeleton";
export { AnalyticsEmpty } from "./AnalyticsEmpty/AnalyticsEmpty";