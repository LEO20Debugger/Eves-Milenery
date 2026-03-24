'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useCartStore from '@/store/cart.store';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, updateQty, remove, clear } = useCartStore();
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; drawerRef.current?.focus(); }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" aria-hidden="true" onClick={onClose} />
      )}

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-surface-container-lowest shadow-2xl transition-transform duration-300 focus:outline-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/20">
          <h2 className="font-headline text-xl">Your Bag</h2>
          <button
            onClick={onClose}
            aria-label="Close bag"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-outline hover:text-on-surface transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <p className="font-label text-xs uppercase tracking-widest text-outline">Your bag is empty</p>
              <button
                onClick={onClose}
                className="editorial-underline font-label text-xs uppercase tracking-widest"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-8">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-4">
                  <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden bg-surface-container">
                    <Image
                      src={product.images[0] ?? '/placeholder.png'}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <p className="font-label text-[11px] uppercase tracking-wider text-on-surface line-clamp-2">
                      {product.name}
                    </p>
                    <p className="font-body text-sm text-outline">
                      ₦{product.price.toLocaleString('en-NG')}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() => updateQty(product.id, quantity - 1)}
                        aria-label={`Decrease quantity of ${product.name}`}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center border-b border-outline-variant text-on-surface hover:border-primary transition-colors"
                      >
                        −
                      </button>
                      <span className="font-label text-xs w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => updateQty(product.id, quantity + 1)}
                        aria-label={`Increase quantity of ${product.name}`}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center border-b border-outline-variant text-on-surface hover:border-primary transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <p className="font-body text-sm text-on-surface">
                      ₦{(product.price * quantity).toLocaleString('en-NG')}
                    </p>
                    <button
                      onClick={() => remove(product.id)}
                      aria-label={`Remove ${product.name}`}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-outline hover:text-error transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant/20 px-6 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-label text-[10px] uppercase tracking-widest text-outline">Total</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={clear}
                  className="font-label text-[10px] uppercase tracking-widest text-outline hover:text-error transition-colors"
                >
                  Clear Bag
                </button>
                <span className="font-headline text-xl">₦{total.toLocaleString('en-NG')}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block min-h-[44px] w-full bg-primary text-on-primary px-4 py-4 text-center font-label text-xs uppercase tracking-[0.2em] hover:bg-primary-container transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/cart"
              onClick={onClose}
              className="block min-h-[44px] w-full border-b border-outline-variant px-4 py-3 text-center font-label text-xs uppercase tracking-widest text-on-surface hover:border-primary transition-colors"
            >
              View Bag
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
