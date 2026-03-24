'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useWishlistStore from '@/store/wishlist.store';
import useCartStore from '@/store/cart.store';

export default function WishlistPage() {
  const router = useRouter();
  const { items, remove, load, loaded } = useWishlistStore();
  const addToCart = useCartStore((s) => s.add);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login?returnTo=/wishlist'); return; }
    if (!loaded) load();
  }, [router, load, loaded]);

  if (!mounted) return null;

  return (
    <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
      <header className="mb-16">
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.2em] text-outline mb-4">Curated Selection</p>
        <h2 className="font-headline text-5xl md:text-6xl italic leading-tight">Wishlist</h2>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-outline" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <p className="font-label text-xs uppercase tracking-widest text-outline">Your wishlist is empty</p>
          <Link href="/shop" className="editorial-underline font-label text-xs uppercase tracking-widest">
            Browse the Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-x-12">
          {items.map((product, idx) => {
            const pos = idx % 3;
            const colClass =
              pos === 0 ? 'md:col-span-7' :
              pos === 1 ? 'md:col-start-9 md:col-span-4 md:mt-12' :
              'md:col-span-5';
            const aspect =
              pos === 0 ? 'aspect-square' :
              pos === 1 ? 'aspect-square' :
              'aspect-[4/5]';

            return (
              <div key={product.productId} className={`group ${colClass}`}>
                <div className={`relative overflow-hidden bg-surface-dim ${aspect} mb-8`}>
                  <Link href={`/shop/${product.slug}`}>
                    <Image
                      src={product.images[0] ?? '/placeholder.png'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 58vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <button
                    onClick={() => remove(product.productId)}
                    aria-label={`Remove ${product.name} from wishlist`}
                    className="absolute top-4 right-4 p-3 bg-surface-container-lowest/80 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-surface-container transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="font-headline text-xl hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="font-body text-base text-outline">₦{product.price.toLocaleString('en-NG')}</p>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({ id: product.productId, name: product.name, price: product.price, images: product.images });
                      remove(product.productId);
                    }}
                    className="bg-primary text-on-primary px-6 py-3 font-label text-xs uppercase tracking-widest hover:bg-primary-container transition-colors whitespace-nowrap min-h-[44px]"
                  >
                    Move to Bag
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
