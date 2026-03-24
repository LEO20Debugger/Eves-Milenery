import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShopClient from './ShopClient';
import { type Category } from '@/components/FilterSidebar';

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse our full collection of premium fascinators and caps. Filter by category, price, and colour to find your perfect style.',
  openGraph: {
    title: 'Shop | Fascinator Cap Store',
    description:
      'Browse our full collection of premium fascinators and caps. Filter by category, price, and colour to find your perfect style.',
    type: 'website',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fascinatorcapstore.com'}/shop`,
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fascinatorcapstore.com'}/og-shop.jpg`,
        width: 1200,
        height: 630,
        alt: 'Shop — Fascinator Cap Store',
      },
    ],
  },
};

export const revalidate = 60;

async function getCategories(): Promise<Category[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data ?? []);
  } catch {
    return [];
  }
}

interface ShopPageProps {
  searchParams: Promise<{ categoryId?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [categories, resolvedParams] = await Promise.all([
    getCategories(),
    searchParams,
  ]);

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      }
    >
      <ShopClient
        categories={categories}
        initialCategoryId={resolvedParams.categoryId}
      />
    </Suspense>
  );
}
