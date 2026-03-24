'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useCartStore from '@/store/cart.store';

type PaymentProvider = 'paystack' | 'stripe';

interface FormState {
  name: string;
  phone: string;
  deliveryAddress: string;
  provider: PaymentProvider;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total } = useCartStore();

  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    deliveryAddress: '',
    provider: 'paystack',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    if (!form.deliveryAddress.trim()) next.deliveryAddress = 'Delivery address is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      setApiError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/payments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          deliveryAddress: form.deliveryAddress,
          provider: form.provider,
          cart: items.map(({ product, quantity }) => ({
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
          })),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Failed to initialize payment.');
      }

      const { paymentUrl } = await res.json();
      if (!paymentUrl) throw new Error('No payment URL returned.');

      window.location.href = paymentUrl;
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="mt-4 text-gray-500">
          Your cart is empty.{' '}
          <a href="/shop" className="underline text-gray-900">
            Continue shopping
          </a>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Two-column on md+, single-column on mobile */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* ── Checkout Form ── */}
          <section className="flex-1">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Full name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
              </div>

              {/* Delivery address */}
              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery address
                </label>
                <textarea
                  id="deliveryAddress"
                  rows={3}
                  autoComplete="street-address"
                  value={form.deliveryAddress}
                  onChange={(e) => setForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none ${
                    errors.deliveryAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deliveryAddress && (
                  <p className="mt-1 text-xs text-red-600">{errors.deliveryAddress}</p>
                )}
              </div>

              {/* Payment method */}
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">
                  Payment method
                </legend>
                <div className="space-y-2">
                  {(
                    [
                      { value: 'paystack', label: 'Paystack', description: 'Pay with card or bank transfer (Nigeria)' },
                      { value: 'stripe', label: 'Stripe', description: 'Pay with card (International)' },
                    ] as const
                  ).map(({ value, label, description }) => (
                    <label
                      key={value}
                      className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                        form.provider === value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="provider"
                        value={value}
                        checked={form.provider === value}
                        onChange={() => setForm((f) => ({ ...f, provider: value }))}
                        className="mt-0.5 h-4 w-4 accent-gray-900"
                      />
                      <span>
                        <span className="block text-sm font-medium text-gray-900">{label}</span>
                        <span className="block text-xs text-gray-500">{description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {apiError && (
                <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {apiError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] w-full rounded-md bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Redirecting to payment…' : 'Pay now'}
              </button>
            </form>
          </section>

          {/* ── Order Summary ── */}
          <aside className="w-full md:w-80 flex-shrink-0">
            <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4 sticky top-4">
              <h2 className="text-base font-semibold text-gray-900">Order summary</h2>

              <ul className="space-y-3 divide-y divide-gray-100">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3 pt-3 first:pt-0">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
                      <Image
                        src={product.images[0] ?? '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                      ₦{(product.price * quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
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
          </aside>
        </div>
      </div>
    </main>
  );
}
