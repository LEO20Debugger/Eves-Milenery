'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

interface Order {
  id: string;
  reference: string;
  totalAmount: string;
  status: string;
  deliveryAddress: string;
  createdAt: string;
  items: OrderItem[];
}

function OrderSuccessContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        const res = await fetch(`${apiUrl}/orders/${params.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Failed to load order.');
        }

        const data = await res.json();
        setOrder(data);
        setStatus('success');
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('error');
      }
    }

    fetchOrder();
  }, [params.id]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" aria-hidden="true" />
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <Link href="/shop" className="min-h-[44px] inline-flex items-center rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors">
          Continue Shopping
        </Link>
      </main>
    );
  }

  const total = parseFloat(order!.totalAmount);

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Success header */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100" aria-hidden="true">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmed</h1>
          <p className="text-sm text-gray-500">
            Thank you for your purchase. We'll get it to you soon.
          </p>
        </div>

        {/* Order reference */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-1">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Order reference</p>
          <p className="font-mono text-sm font-semibold text-gray-900">{order!.reference}</p>
        </div>

        {/* Items purchased */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Items purchased</h2>
          <ul className="divide-y divide-gray-100">
            {order!.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 flex-shrink-0 ml-4">
                  ₦{(parseFloat(item.unitPrice) * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">
              ₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/orders"
            className="min-h-[44px] flex-1 inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            View my orders
          </Link>
          <Link
            href="/shop"
            className="min-h-[44px] flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" aria-hidden="true" />
        </main>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
