'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminSettingsPage() {
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }

    fetch(`${apiUrl}/settings`)
      .then((r) => r.json())
      .then((data) => {
        setHeroImageUrl(data.hero_image_url ?? '');
        setHeroHeadline(data.hero_headline ?? 'The Occasion Anthology');
        setHeroSubtext(data.hero_subtext ?? 'New Collection Available');
      })
      .catch(() => {});
  }, [apiUrl, router]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${apiUrl}/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed.');
      const data = await res.json();
      setHeroImageUrl(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${apiUrl}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hero_image_url: heroImageUrl,
          hero_headline: heroHeadline,
          hero_subtext: heroSubtext,
        }),
      });
      if (!res.ok) throw new Error('Failed to save settings.');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-headline text-2xl font-bold text-on-surface tracking-wide mb-8">
          Site Settings
        </h1>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero section */}
          <section className="border border-outline-variant/20 p-6">
            <h2 className="font-label text-xs uppercase tracking-[0.2em] text-outline mb-6">
              Hero Section
            </h2>

            {/* Image preview */}
            {heroImageUrl && (
              <div className="relative w-full aspect-video mb-4 overflow-hidden bg-outline-variant/10">
                <Image
                  src={heroImageUrl}
                  alt="Hero preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 672px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Upload */}
            <div className="mb-4">
              <label className="block font-label text-xs uppercase tracking-[0.15em] text-outline mb-2">
                Hero Image
              </label>
              <div className="flex gap-3 items-center">
                <label className="cursor-pointer min-h-[44px] inline-flex items-center border border-outline-variant/30 px-4 font-label text-xs uppercase tracking-[0.15em] text-on-surface hover:bg-outline-variant/10 transition-colors">
                  {uploading ? 'Uploading…' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
                <span className="font-body text-xs text-outline">or paste a URL below</span>
              </div>
            </div>

            {/* URL input */}
            <div className="mb-4">
              <label className="block font-label text-xs uppercase tracking-[0.15em] text-outline mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full border border-outline-variant/30 bg-surface px-3 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Headline */}
            <div className="mb-4">
              <label className="block font-label text-xs uppercase tracking-[0.15em] text-outline mb-2">
                Headline
              </label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full border border-outline-variant/30 bg-surface px-3 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {/* Subtext */}
            <div>
              <label className="block font-label text-xs uppercase tracking-[0.15em] text-outline mb-2">
                Subtext
              </label>
              <input
                type="text"
                value={heroSubtext}
                onChange={(e) => setHeroSubtext(e.target.value)}
                className="w-full border border-outline-variant/30 bg-surface px-3 py-2 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </section>

          {error && (
            <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          {success && (
            <p className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">Settings saved successfully.</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] bg-primary px-8 py-3 font-label text-xs uppercase tracking-[0.15em] text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </div>
    </main>
  );
}
