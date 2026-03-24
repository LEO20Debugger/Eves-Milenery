import { isLimitedStock, isSellingFast } from './product-badge.util';

describe('product-badge.util', () => {
  describe('isLimitedStock', () => {
    it('returns true when stock is 0', () => {
      expect(isLimitedStock(0)).toBe(true);
    });

    it('returns true when stock is exactly 5', () => {
      expect(isLimitedStock(5)).toBe(true);
    });

    it('returns false when stock is 6', () => {
      expect(isLimitedStock(6)).toBe(false);
    });

    it('returns false when stock is large', () => {
      expect(isLimitedStock(100)).toBe(false);
    });
  });

  describe('isSellingFast', () => {
    it('returns true when sold > 50% of initialStock', () => {
      expect(isSellingFast(6, 10)).toBe(true);
    });

    it('returns false when sold equals exactly 50% of initialStock', () => {
      expect(isSellingFast(5, 10)).toBe(false);
    });

    it('returns false when sold < 50% of initialStock', () => {
      expect(isSellingFast(3, 10)).toBe(false);
    });

    it('returns false when initialStock is 0', () => {
      expect(isSellingFast(0, 0)).toBe(false);
    });

    it('returns false when initialStock is negative', () => {
      expect(isSellingFast(5, -1)).toBe(false);
    });
  });
});
