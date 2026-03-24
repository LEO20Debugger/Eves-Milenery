'use client';

import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cart.store';

export interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  initialStock: number;
  sold?: number;
  images: string[];
}

function isLimitedStock(stock: number): boolean {
  return stock > 0 && stock <= 5;
}

function isSellingFast(sold: number, initialStock: number): boolean {
  return initialStock > 0 && sold > initialStock * 0.5;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  stock,
  initialStock,
  sold = 0,
  images,
}: ProductCardProps) {
  const add = useCartStore((s) => s.add);
  const outOfStock = stock === 0;
  const imageUrl = images[0] ?? '/placeholder.png';

  return (
    <article className="group flex flex-col">
      <Link href={`/shop/${slug}`} className="relative block overflow-hidden bg-surface-container aspect-[3/4]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isLimitedStock(stock) && (
            <span className="bg-primary text-on-primary px-2 py-0.5 font-label text-[9px] uppercase tracking-widest">
              Limited
            </span>
          )}
          {isSellingFast(sold, initialStock) && (
            <span className="bg-primary text-on-primary px-2 py-0.5 font-label text-[9px] uppercase tracking-widest">
              Selling Fast
            </span>
          )}
          {outOfStock && (
            <span className="bg-outline text-on-primary px-2 py-0.5 font-label text-[9px] uppercase tracking-widest">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <Link href={`/shop/${slug}`} className="font-label text-[11px] uppercase tracking-wider text-on-surface hover:text-primary transition-colors line-clamp-2">
            {name}
          </Link>
          <span className="font-body text-sm text-outline ml-2 flex-shrink-0">
            ₦{price.toLocaleString('en-NG')}
          </span>
        </div>
        <button
          onClick={() => !outOfStock && add({ id, name, price, images })}
          disabled={outOfStock}
          aria-label={outOfStock ? `${name} is sold out` : `Add ${name} to bag`}
          className="w-full border-b border-outline-variant py-3 text-left flex justify-between items-center group/btn disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition-colors"
        >
          <span className="font-label text-[10px] uppercase tracking-widest">
            {outOfStock ? 'Sold Out' : 'Add to Bag'}
          </span>
          {!outOfStock && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transform group-hover/btn:translate-x-1 transition-transform" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}
