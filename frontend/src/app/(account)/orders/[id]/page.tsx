'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

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
  paymentProvider: string;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

async function fetchOrder(id: string, token: string): Promise<Order> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Failed to load order.');
  }
  return res.json();
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => fetchOrder(params.id, token!),
    enabled: !!token && !!params.id,
  });

  if (!token) return null;

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" aria-hidden="true" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
        <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back to orders
        </Link>
        <p className="mt-6 text-red-600">{(error as Error).message}</p>
      </main>
    );
  }

  if (!order) return null;

  const total = parseFloat(order.totalAmount);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back link */}
        <Link href="/orders" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back to orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order details</h1>
            <p className="font-mono text-sm text-gray-500 mt-1">{order.reference}</p>
          </div>
          <span
            className={`self-start sm:self-auto inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${
              STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {order.status}
          </span>
        </div>

        {/* Order meta */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date placed</p>
            <p className="text-gray-900">
              {new Date(order.createdAt).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment method</p>
            <p className="text-gray-900 capitalize">{order.paymentProvider}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Delivery address</p>
            <p className="text-gray-900 whitespace-pre-line">{order.deliveryAddress}</p>
          </div>
        </div>

        {/* Order items */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Items</h2>
          <ul className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × ₦{parseFloat(item.unitPrice).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900 flex-shrink-0 ml-4">
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
        <Link
          href="/shop"
          className="min-h-[44px] inline-flex items-center rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
