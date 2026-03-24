'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login?returnTo=/profile'); return; }

    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/login?returnTo=/profile');
          return;
        }
        if (!res.ok) throw new Error('Failed to load profile.');
        return res.json();
      })
      .then((data) => { if (data) setProfile(data); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl, router]);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent" />
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-outline">{error ?? 'Something went wrong.'}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-md mx-auto">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-10">
        <div className="h-20 w-20 flex items-center justify-center border border-outline-variant/30 bg-surface-container mb-4">
          <span className="font-headline text-3xl text-primary">
            {profile.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="font-headline text-2xl text-on-surface">{profile.name}</h1>
        <p className="font-label text-xs uppercase tracking-[0.2em] text-outline mt-1">
          {profile.role === 'admin' ? 'Administrator' : 'Customer'}
        </p>
      </div>

      {/* Details */}
      <div className="border border-outline-variant/20 divide-y divide-outline-variant/10 mb-8">
        {[
          { label: 'Email', value: profile.email },
          { label: 'Phone', value: profile.phone ?? '—' },
          { label: 'Member since', value: new Date(profile.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long' }) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-4 py-3">
            <span className="font-label text-[10px] uppercase tracking-[0.15em] text-outline">{label}</span>
            <span className="font-body text-sm text-on-surface">{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/orders"
          className="flex items-center justify-between w-full min-h-[44px] border border-outline-variant/30 px-4 py-3 font-label text-xs uppercase tracking-[0.15em] text-on-surface hover:bg-outline-variant/10 transition-colors"
        >
          My Orders
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        {profile.role === 'admin' && (
          <Link
            href="/admin/products"
            className="flex items-center justify-between w-full min-h-[44px] border border-outline-variant/30 px-4 py-3 font-label text-xs uppercase tracking-[0.15em] text-on-surface hover:bg-outline-variant/10 transition-colors"
          >
            Admin Dashboard
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full min-h-[44px] border border-red-200 px-4 py-3 font-label text-xs uppercase tracking-[0.15em] text-red-600 hover:bg-red-50 transition-colors"
        >
          Log out
        </button>
      </div>
    </main>
  );
}
