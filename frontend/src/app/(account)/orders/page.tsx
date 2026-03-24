'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface Order {
  id: string;
  reference: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  deliveryAddress: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

async function fetchOrders(token: string): Promise<{ data: Order[]; total: number }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${apiUrl}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Failed to load orders.');
  }
  return res.json();
}

export default function OrdersPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(token!),
    enabled: !!token,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order History</h1>
        <p className="text-red-600">{(error as Error).message}</p>
      </main>
    );
  }

  const orders = data?.data ?? [];

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-4 text-center py-16">
            <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
            <Link
              href="/shop"
              className="min-h-[44px] inline-flex items-center rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-5 hover:border-gray-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-mono text-sm font-semibold text-gray-900 truncate">
                        {order.reference}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold text-gray-900">
                        ₦{parseFloat(order.totalAmount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
