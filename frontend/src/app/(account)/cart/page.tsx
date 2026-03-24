'use client';

import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cart.store';

export default function CartPage() {
  const { items, updateQty, remove, total } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <Link
            href="/shop"
            className="min-h-[44px] inline-flex items-center rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {/* Cart items — single column */}
        <ul className="space-y-4">
          {items.map(({ product, quantity }) => (
            <li
              key={product.id}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              {/* Product image */}
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                <Image
                  src={product.images[0] ?? '/placeholder.png'}
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-sm text-gray-500">
                  ₦{product.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQty(product.id, quantity - 1)}
                    aria-label={`Decrease quantity of ${product.name}`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => updateQty(product.id, quantity + 1)}
                    aria-label={`Increase quantity of ${product.name}`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Line total + remove */}
              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  ₦{(product.price * quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
                <button
                  onClick={() => remove(product.id)}
                  aria-label={`Remove ${product.name} from cart`}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          </div>
          <Link
            href="/checkout"
            className="block min-h-[44px] w-full rounded-md bg-gray-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/shop"
            className="block min-h-[44px] w-full rounded-md border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
