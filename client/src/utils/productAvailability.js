export const getProductStockState = (product = {}) => {
  const hasExplicitStockFlag = typeof product.isInStock === 'boolean';
  const stockQuantity = Number(product.stockQuantity ?? 0);
  const lowStockThreshold = Number(product.lowStockThreshold ?? 0);

  if (hasExplicitStockFlag) {
    return {
      isInStock: product.isInStock,
      isLowStock: Boolean(product.isLowStock),
      stockQuantity: Number.isFinite(stockQuantity) && stockQuantity > 0 ? stockQuantity : null,
    };
  }

  const derivedStockQuantity = Number.isFinite(stockQuantity) && stockQuantity > 0 ? stockQuantity : null;
  const isInStock = derivedStockQuantity === null ? true : derivedStockQuantity > 0;
  const isLowStock = derivedStockQuantity !== null && derivedStockQuantity > 0 && derivedStockQuantity <= lowStockThreshold;

  return {
    isInStock,
    isLowStock,
    stockQuantity: derivedStockQuantity,
  };
};
