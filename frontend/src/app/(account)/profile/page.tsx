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

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      .then((data) => {
        if (data) {
          setProfile(data);
          setName(data.name);
          setPhone(data.phone ?? '');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiUrl}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update profile.');
      const updated = await res.json();
      setProfile(updated);
      // update localStorage so nav reflects new name
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, name: updated.name }));
        window.dispatchEvent(new Event('storage'));
      }
      setSaveSuccess(true);
      setEditing(false);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
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

      {/* Edit form */}
      {editing ? (
        <form onSubmit={handleSave} className="border border-outline-variant/20 p-4 mb-8 space-y-4">
          <div>
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-outline block mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border-b border-outline-variant bg-transparent py-2 text-sm font-body focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="font-label text-[10px] uppercase tracking-[0.15em] text-outline block mb-1">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full border-b border-outline-variant bg-transparent py-2 text-sm font-body focus:outline-none focus:border-primary"
            />
          </div>
          {saveError && <p className="text-xs text-red-500">{saveError}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-h-[44px] bg-primary text-on-primary font-label text-xs uppercase tracking-widest disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setName(profile.name); setPhone(profile.phone ?? ''); }}
              className="flex-1 min-h-[44px] border border-outline-variant font-label text-xs uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="border border-outline-variant/20 divide-y divide-outline-variant/10 mb-8">
          {saveSuccess && (
            <p className="px-4 py-2 text-xs text-green-600 font-label">Profile updated.</p>
          )}
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
          <button
            onClick={() => setEditing(true)}
            className="w-full flex items-center justify-between px-4 py-3 font-label text-xs uppercase tracking-[0.15em] text-primary hover:bg-outline-variant/10 transition-colors"
          >
            Edit Details
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {profile.role !== 'admin' && (
          <Link
            href="/orders"
            className="flex items-center justify-between w-full min-h-[44px] border border-outline-variant/30 px-4 py-3 font-label text-xs uppercase tracking-[0.15em] text-on-surface hover:bg-outline-variant/10 transition-colors"
          >
            My Orders
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        )}

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
