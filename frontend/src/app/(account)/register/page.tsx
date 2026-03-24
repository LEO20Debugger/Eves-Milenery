'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = Array.isArray(body?.message) ? body.message.join(', ') : (body?.message ?? 'Registration failed.');
        throw new Error(msg);
      }

      router.push('/login?registered=1');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  function field(id: keyof FormState) {
    return {
      id,
      value: form[id],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [id]: e.target.value })),
      className: `w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
        errors[id] ? 'border-red-500' : 'border-gray-300'
      }`,
    };
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create account</h1>
        <p className="text-sm text-gray-500 mb-8">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-gray-900 underline underline-offset-2">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input type="text" autoComplete="name" {...field('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input type="email" autoComplete="email" {...field('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <input type="tel" autoComplete="tel" {...field('phone')} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...field('password')}
                className={`w-full rounded-md border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

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
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </main>
  );
}
