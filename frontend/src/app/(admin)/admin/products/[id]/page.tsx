'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminProductForm from '@/components/AdminProductForm';

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
  color?: string;
  images: string[];
}

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    if (!id || id === 'new') { setLoading(false); return; }
    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => {
        if (!r.ok) throw new Error('Product not found.');
        return r.json();
      })
      .then((data) => setProduct(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load product.'))
      .finally(() => setLoading(false));
  }, [id, apiUrl]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-900 border-t-transparent" aria-hidden="true" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-xl mx-auto">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  const isNew = id === 'new';

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isNew ? 'Create Product' : 'Edit Product'}
        </h1>
        <AdminProductForm
          productId={isNew ? undefined : id}
          initialData={
            product
              ? {
                  name: product.name,
                  description: product.description ?? '',
                  price: product.price,
                  stock: String(product.stock),
                  categoryId: product.categoryId,
                  color: product.color ?? '',
                  images: product.images ?? [],
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
