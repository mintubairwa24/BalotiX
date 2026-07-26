/**
 * FILE: src/components/admin/index.js
 *
 * src/components/admin/index.js
 * Top-level barrel for src/components/admin/*
 * Lets consumers write: import { AdminLayout, DashboardOverview } from "../components/admin";
 * Consistent with every other feature folder's aggregation barrel in this project.
 */
export { AdminLayout } from "./AdminLayout/AdminLayout";
export { AdminSidebar } from "./AdminSidebar/AdminSidebar";
export { AdminHeader } from "./AdminHeader/AdminHeader";
export { AdminWelcome } from "./AdminWelcome/AdminWelcome";
export { DashboardOverview } from "./DashboardOverview/DashboardOverview";
export { DashboardStats } from "./DashboardStats/DashboardStats";
export { RecentActivity } from "./RecentActivity/RecentActivity";
export { QuickActions } from "./QuickActions/QuickActions";
export { AdminSkeleton } from "./AdminSkeleton/AdminSkeleton";
