'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const sessionId = searchParams.get('session_id');

    if (!reference && !sessionId) {
      setErrorMessage('No payment reference found. Please try again.');
      setStatus('error');
      return;
    }

    async function verify() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

        // Paystack uses `reference`; Stripe callback uses `session_id`
        const param = reference
          ? `reference=${encodeURIComponent(reference!)}`
          : `session_id=${encodeURIComponent(sessionId!)}`;

        const res = await fetch(`${apiUrl}/payments/verify?${param}`);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message ?? 'Payment verification failed.');
        }

        const { orderId } = await res.json();
        if (!orderId) throw new Error('Order not found after payment.');

        router.replace(`/orders/${orderId}/success`);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
        setStatus('error');
      }
    }

    verify();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent mb-4" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-gray-900">Verifying your payment…</h1>
        <p className="mt-2 text-sm text-gray-500">Please wait, do not close this page.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="max-w-md w-full rounded-lg border border-red-200 bg-red-50 p-8 space-y-4">
        <h1 className="text-xl font-semibold text-red-800">Payment failed</h1>
        <p className="text-sm text-red-700">{errorMessage}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href="/checkout"
            className="min-h-[44px] inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            Try again
          </a>
          <a
            href="/cart"
            className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to cart
          </a>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" aria-hidden="true" />
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
