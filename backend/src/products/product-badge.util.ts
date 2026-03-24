/**
 * Returns true when the product has limited stock (5 or fewer units remaining).
 * Validates: Requirements 1.4
 */
export function isLimitedStock(stock: number): boolean {
  return stock <= 5;
}

/**
 * Returns true when the product is selling fast (sold more than 50% of initial stock).
 * Validates: Requirements 1.5
 */
export function isSellingFast(sold: number, initialStock: number): boolean {
  if (initialStock <= 0) return false;
  return sold > initialStock * 0.5;
}
