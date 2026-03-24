'use client';

import { useEffect, useState } from 'react';

export interface Category {
  id: string;
  name: string;
}

export interface FilterValues {
  categoryIds: string[];
  minPrice: string;
  maxPrice: string;
  color: string;
}

interface FilterSidebarProps {
  categories: Category[];
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

const COLORS = ['Black', 'White', 'Red', 'Blue', 'Pink', 'Gold', 'Ivory', 'Navy'];

export default function FilterSidebar({ categories, filters, onChange }: FilterSidebarProps) {
  const [local, setLocal] = useState<FilterValues>(filters);

  // Sync if parent resets filters
  useEffect(() => {
    setLocal(filters);
  }, [filters]);

  const toggleCategory = (id: string) => {
    const next = local.categoryIds.includes(id)
      ? local.categoryIds.filter((c) => c !== id)
      : [...local.categoryIds, id];
    const updated = { ...local, categoryIds: next };
    setLocal(updated);
    onChange(updated);
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onChange(updated);
  };

  const handleColorChange = (color: string) => {
    const updated = { ...local, color: local.color === color ? '' : color };
    setLocal(updated);
    onChange(updated);
  };

  const handleReset = () => {
    const reset: FilterValues = { categoryIds: [], minPrice: '', maxPrice: '', color: '' };
    setLocal(reset);
    onChange(reset);
  };

  const hasActiveFilters =
    local.categoryIds.length > 0 || local.minPrice || local.maxPrice || local.color;

  return (
    <aside aria-label="Product filters" className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 underline hover:text-gray-700 min-h-[44px] min-w-[44px]"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium te
xt-gray-700">Category</legend>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <label className="flex cursor-pointer items-center gap-2 min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={local.categoryIds.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      {/* Price range */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">Price range (₦)</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={local.minPrice}
            onChange={(e) => handlePriceChange('minPrice', e.target.value)}
            aria-label="Minimum price"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={local.maxPrice}
            onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
            aria-label="Maximum price"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 min-h-[44px]"
          />
        </div>
      </fieldset>

      {/* Color */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-gray-700">Color</legend>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              aria-pressed={local.color === color}
              className={`min-h-[44px] rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                local.color === color
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}
