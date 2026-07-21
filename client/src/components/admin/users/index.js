// FILE: src/components/admin/users/index.js
/**
 * Top-level barrel for src/components/admin/users/*
 * Lets consumers write: import { UsersTable, UserDetails } from "../components/admin/users";
 * Consistent with every other feature folder's aggregation barrel in this project.
 */
export { UsersTable } from "./UsersTable/UsersTable";
export { UserRow } from "./UserRow/UserRow";
export { UserProfileCard } from "./UserProfileCard/UserProfileCard";
export { UserDetails } from "./UserDetails/UserDetails";
export { UserAvatar } from "./UserAvatar/UserAvatar";
export { UserStatus } from "./UserStatus/UserStatus";
export { UserRoleBadge } from "./UserRoleBadge/UserRoleBadge";
export { UserFilters } from "./UserFilters/UserFilters";
export { UserSearch } from "./UserSearch/UserSearch";
export { UserActions } from "./UserActions/UserActions";
export { UserStatistics } from "./UserStatistics/UserStatistics";
export { UserAddressCard } from "./UserAddressCard/UserAddressCard";
export { UserActivityTimeline } from "./UserActivityTimeline/UserActivityTimeline";
export { UserOrdersSummary } from "./UserOrdersSummary/UserOrdersSummary";
export { UserPagination } from "./UserPagination/UserPagination";
export { UserEmpty } from "./UserEmpty/UserEmpty";
export { UserSkeleton } from "./UserSkeleton/UserSkeleton";
export { DeleteUserModal } from "./DeleteUserModal/DeleteUserModal";
export { SuspendUserModal } from "./SuspendUserModal/SuspendUserModal";
export { ActivateUserModal } from "./ActivateUserModal/ActivateUserModal";
export { ChangeRoleModal } from "./ChangeRoleModal/ChangeRoleModal";