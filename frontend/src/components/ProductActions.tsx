'use client';

import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cart.store';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const add = useCartStore((s) => s.add);
  const router = useRouter();
  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    add({ id: product.id, name: product.name, price: product.price, images: product.images });
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    add({ id: product.id, name: product.name, price: product.price, images: product.images });
    router.push('/checkout');
  };

  if (outOfStock) {
    return (
      <div className="flex flex-col gap-3">
        <p
          role="status"
          className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-500"
        >
          Out of stock
        </p>
        <button
          disabled
          aria-disabled="true"
          className="min-h-[44px] w-full rounded-lg bg-gray-300 px-6 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed"
        >
          Add to Cart
        </button>
        <button
          disabled
          aria-disabled="true"
          className="min-h-[44px] w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed"
        >
          Buy Now
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleAddToCart}
        aria-label={`Add ${product.name} to cart`}
        className="min-h-[44px] w-full rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
      >
        Add to Cart
      </button>
      <button
        onClick={handleBuyNow}
        aria-label={`Buy ${product.name} now`}
        className="min-h-[44px] w-full rounded-lg border-2 border-gray-900 px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-900 hover:text-white"
      >
        Buy Now
      </button>
    </div>
  );
}
