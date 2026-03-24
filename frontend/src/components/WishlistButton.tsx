'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useWishlistStore from '@/store/wishlist.store';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
}

export default function WishlistButton({ productId, productName, className = '' }: WishlistButtonProps) {
  const router = useRouter();
  const { toggle, has, load, loaded } = useWishlistStore();
  const saved = has(productId);

  useEffect(() => {
    if (!loaded && isLoggedIn()) load();
  }, [load, loaded]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) {
      router.push('/login?returnTo=/wishlist');
      return;
    }
    toggle(productId);
  }

  return (
    <button
      onClick={handleClick}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      className={`flex items-center justify-center transition-colors ${className}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        className={saved ? 'text-primary' : 'text-outline hover:text-primary'}
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
      {className?.includes('w-full') && (
        <span className="ml-2 font-label text-xs uppercase tracking-widest">
          {saved ? 'Saved' : 'Save to Wishlist'}
        </span>
      )}
    </button>
  );
}
