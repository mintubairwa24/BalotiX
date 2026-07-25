// FILE: src/components/admin/inventory/index.js
/**
 * Top-level barrel for src/components/admin/inventory/*
 * Lets consumers write: import { InventoryTable, InventoryDetails } from "../components/admin/inventory";
 * Consistent with every other feature folder's aggregation barrel in this project.
 */
export { InventoryTable } from "./InventoryTable/InventoryTable";
export { InventoryRow } from "./InventoryRow/InventoryRow";
export { InventoryDetails } from "./InventoryDetails/InventoryDetails";
export { StockAdjustmentForm } from "./StockAdjustmentForm/StockAdjustmentForm";
export { InventoryStatus } from "./InventoryStatus/InventoryStatus";
export { InventoryFilters } from "./InventoryFilters/InventoryFilters";
export { InventorySearch } from "./InventorySearch/InventorySearch";
export { InventoryActions } from "./InventoryActions/InventoryActions";
export { LowStockCard } from "./LowStockCard/LowStockCard";
export { StockHistory } from "./StockHistory/StockHistory";
export { UpdateStockModal } from "./UpdateStockModal/UpdateStockModal";
export { InventoryPagination } from "./InventoryPagination/InventoryPagination";
export { InventoryEmpty } from "./InventoryEmpty/InventoryEmpty";
export { InventorySkeleton } from "./InventorySkeleton/InventorySkeleton";