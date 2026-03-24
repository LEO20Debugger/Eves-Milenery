'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { type ProductCardProps } from '@/components/ProductCard';
import { type Category } from '@/components/FilterSidebar';
import WishlistButton from '@/components/WishlistButton';

interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  stock: number;
  initialStock: number;
  images: string[];
  sold?: number;
}

interface ProductsResponse {
  data: ApiProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FilterValues {
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  color: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];
const LIMIT = 12;

async function fetchProducts(page: number, sort: SortValue, filters: FilterValues): Promise<ProductsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(LIMIT));
  params.set('sort', sort);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.color) params.set('color', filters.color);

  const res = await fetch(`${baseUrl}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const json = await res.json();
  if (Array.isArray(json)) return { data: json, total: json.length, page, limit: LIMIT, totalPages: 1 };
  return {
    data: json.data ?? [],
    total: json.total ?? 0,
    page: json.page ?? page,
    limit: json.limit ?? LIMIT,
    totalPages: json.totalPages ?? (Math.ceil((json.total ?? 0) / LIMIT) || 1),
  };
}

function toProps(p: ApiProduct): ProductCardProps {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
    stock: p.stock,
    initialStock: p.initialStock,
    images: p.images,
    sold: p.sold ?? 0,
  };
}

interface ShopClientProps {
  categories: Category[];
  initialCategoryId?: string;
}

export default function ShopClient({ categories, initialCategoryId }: ShopClientProps) {
  const [filters, setFilters] = useState<FilterValues>({
    categoryId: initialCategoryId ?? '',
    minPrice: '',
    maxPrice: '',
    color: '',
  });
  const [sort, setSort] = useState<SortValue>('newest');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, sort, filters],
    queryFn: () => fetchProducts(page, sort, filters),
    placeholderData: (prev: ProductsResponse | undefined) => prev,
  });

  const products = (data?.data ?? []).map(toProps);
  const totalPages = data?.totalPages ?? 1;

  const handleClear = useCallback(() => {
    setFilters({ categoryId: '', minPrice: '', maxPrice: '', color: '' });
    setSort('newest');
    setPage(1);
  }, []);

  return (
    <div className="pb-32">
      {/* Editorial header */}
      <section className="px-6 mb-12">
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.2rem] text-outline mb-4">
          Collection / L&apos;Essence
        </p>
        <h1 className="font-headline text-5xl md:text-6xl max-w-2xl leading-tight">
          All Pieces.
        </h1>
      </section>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 glass-nav border-b border-outline-variant/10 px-6 py-3 flex items-center justify-between overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-6">
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <span className="font-label text-[0.6rem] uppercase tracking-widest text-outline whitespace-nowrap">Category:</span>
            <select
              value={filters.categoryId}
              onChange={(e) => { setFilters((f) => ({ ...f, categoryId: e.target.value })); setPage(1); }}
              className="font-label text-xs font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="font-label text-[0.6rem] uppercase tracking-widest text-outline whitespace-nowrap">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortValue); setPage(1); }}
              className="font-label text-xs font-medium bg-transparent border-none outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Price filter toggle */}
          <button
            onClick={() => setFilterOpen((v) => !v)}
            className="font-label text-[0.6rem] uppercase tracking-widest text-outline hover:text-primary transition-colors whitespace-nowrap"
          >
            Price {filterOpen ? '▲' : '▼'}
          </button>
        </div>

        <p className="font-label text-[0.6875rem] uppercase tracking-[0.2rem] text-primary whitespace-nowrap ml-4">
          {data ? `${data.total} Items` : '—'}
        </p>
      </div>

      {/* Price filter panel */}
      {filterOpen && (
        <div className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low flex flex-wrap gap-4 items-end">
          <div>
            <label className="font-label text-[0.6rem] uppercase tracking-widest text-outline block mb-1">Min ₦</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => { setFilters((f) => ({ ...f, minPrice: e.target.value })); setPage(1); }}
              placeholder="0"
              className="w-28 border-b border-outline-variant bg-transparent py-1 text-sm font-body focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-[0.6rem] uppercase tracking-widest text-outline block mb-1">Max ₦</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => { setFilters((f) => ({ ...f, maxPrice: e.target.value })); setPage(1); }}
              placeholder="Any"
              className="w-28 border-b border-outline-variant bg-transparent py-1 text-sm font-body focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-[0.6rem] uppercase tracking-widest text-outline block mb-1">Color</label>
            <input
              type="text"
              value={filters.color}
              onChange={(e) => { setFilters((f) => ({ ...f, color: e.target.value })); setPage(1); }}
              placeholder="e.g. Black"
              className="w-28 border-b border-outline-variant bg-transparent py-1 text-sm font-body focus:outline-none focus:border-primary"
            />
          </div>
          <button onClick={handleClear} className="font-label text-[0.6rem] uppercase tracking-widest text-outline hover:text-primary transition-colors">
            Clear All
          </button>
        </div>
      )}

      {/* Product grid */}
      <div className="px-6 mt-16">
        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-label text-xs uppercase tracking-widest text-outline mb-6">No items found</p>
            <button onClick={handleClear} className="editorial-underline font-label text-xs uppercase tracking-widest">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-12 gap-y-16 gap-x-4 md:gap-x-8">
            {products.map((product, idx) => {
              // Pattern per group of 7:
              // 0 → wide portrait, 1 → offset portrait
              // 2,3,4 → 3 side by side
              // 5,6 → 2 side by side
              // Pattern repeats every 5: [wide, offset, 3-col, 3-col, 3-col]
              const pos = idx % 5;
              let colClass = '';
              let aspect = 'aspect-[3/4]';
              let extraClass = '';

              if (pos === 0) {
                colClass = 'col-span-2 md:col-span-7';
                aspect = 'aspect-[4/5]';
              } else if (pos === 1) {
                colClass = 'col-span-2 md:col-span-5';
                aspect = 'aspect-square';
                extraClass = 'md:mt-16';
              } else {
                // pos 2, 3, 4 → 3 side by side
                colClass = 'col-span-1 md:col-span-4';
                aspect = 'aspect-[3/4]';
              }

              return (
                <div key={product.id} className={`group ${colClass} ${extraClass}`}>
                  <Link href={`/shop/${product.slug}`} className="block">
                    <div className={`relative overflow-hidden bg-surface-container-lowest ${aspect}`}>
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                          <span className="font-headline text-4xl text-outline">{product.name.charAt(0)}</span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-outline text-on-primary px-2 py-0.5 font-label text-[9px] uppercase tracking-widest">Sold Out</span>
                        </div>
                      )}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary text-on-primary px-2 py-0.5 font-label text-[9px] uppercase tracking-widest">Limited</span>
                        </div>
                      )}
                      <WishlistButton
                        productId={product.id}
                        productName={product.name}
                        className="absolute top-3 right-3 min-h-[44px] min-w-[44px] bg-surface-container-lowest/70 backdrop-blur-sm"
                      />
                    </div>
                    <div className="mt-4 flex justify-between items-start">
                      <h3 className="font-headline text-base md:text-xl">{product.name}</h3>
                      <span className="font-body text-sm md:text-base ml-2 flex-shrink-0">₦{product.price.toLocaleString('en-NG')}</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-32 mb-8 flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="font-label text-xs uppercase tracking-widest border-b border-outline-variant pb-1 disabled:opacity-30 hover:border-primary transition-colors"
              >
                Previous
              </button>
              <span className="font-label text-xs text-outline">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="font-label text-xs uppercase tracking-widest border-b border-outline-variant pb-1 disabled:opacity-30 hover:border-primary transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
