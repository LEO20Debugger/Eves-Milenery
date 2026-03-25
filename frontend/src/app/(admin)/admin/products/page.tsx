'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  images: string[];
  category?: { name: string };
  deleted: number;
}

interface ProductsResponse {
  data: Product[];
  total: number;
}

interface DeleteModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function DeleteModal({ productName, onConfirm, onCancel, loading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-surface border border-outline-variant/20 p-8">
        {/* Icon */}
        <div className="mb-5 flex h-12 w-12 items-center justify-center border border-red-200 bg-red-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>

        <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
          Remove product
        </h2>
        <p className="font-body text-sm text-outline mb-1">
          You are about to remove:
        </p>
        <p className="font-body text-sm font-semibold text-on-surface mb-6 truncate">
          &ldquo;{productName}&rdquo;
        </p>
        <p className="font-body text-xs text-outline mb-8">
          This product will no longer appear in the store. This action can be reversed by contacting support.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 min-h-[44px] border border-outline-variant/30 font-label text-xs uppercase tracking-[0.15em] text-on-surface hover:bg-outline-variant/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 min-h-[44px] bg-red-600 font-label text-xs uppercase tracking-[0.15em] text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const fetchProducts = useCallback(async (p: number) => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiUrl}/products?page=${p}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to load products.');
      const data: ProductsResponse = await res.json();
      setProducts(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, router]);

  useEffect(() => { fetchProducts(page); }, [page, fetchProducts]);

  async function handleDeleteConfirm() {
    if (!confirmDelete) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    setDeletingId(confirmDelete.id);
    try {
      const res = await fetch(`${apiUrl}/products/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed.');
      setConfirmDelete(null);
      await fetchProducts(page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {confirmDelete && (
        <DeleteModal
          productName={confirmDelete.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
          loading={deletingId === confirmDelete.id}
        />
      )}

      <main className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-headline text-2xl font-bold text-on-surface tracking-wide">Products</h1>
            <Link
              href="/admin/products/new"
              className="min-h-[44px] inline-flex items-center bg-primary px-5 py-2 font-label text-xs uppercase tracking-[0.15em] text-on-primary hover:opacity-90 transition-opacity"
            >
              + Create Product
            </Link>
          </div>

          {error && (
            <p className="mb-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-outline py-12 text-center font-body text-sm">No products found.</p>
          ) : (
            <>
              <div className="overflow-x-auto border border-outline-variant/20">
                <table className="min-w-full divide-y divide-outline-variant/20 bg-surface text-sm">
                  <thead className="bg-outline-variant/5">
                    <tr>
                      <th className="px-4 py-3 text-left font-label text-xs uppercase tracking-[0.15em] text-outline">Image</th>
                      <th className="px-4 py-3 text-left font-label text-xs uppercase tracking-[0.15em] text-outline">Name</th>
                      <th className="px-4 py-3 text-left font-label text-xs uppercase tracking-[0.15em] text-outline">Category</th>
                      <th className="px-4 py-3 text-right font-label text-xs uppercase tracking-[0.15em] text-outline">Price</th>
                      <th className="px-4 py-3 text-right font-label text-xs uppercase tracking-[0.15em] text-outline">Stock</th>
                      <th className="px-4 py-3 text-center font-label text-xs uppercase tracking-[0.15em] text-outline">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-outline-variant/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="relative h-12 w-12 overflow-hidden bg-outline-variant/10 flex-shrink-0">
                            <Image
                              src={p.images?.[0] ?? '/placeholder.png'}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-on-surface max-w-[200px] truncate">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-outline">
                          {p.category?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-on-surface">
                          ₦{parseFloat(p.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-on-surface">{p.stock}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="min-h-[44px] inline-flex items-center border border-outline-variant/30 px-3 py-1.5 font-label text-xs uppercase tracking-[0.1em] text-on-surface hover:bg-outline-variant/10 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setConfirmDelete({ id: p.id, name: p.name })}
                              disabled={deletingId === p.id}
                              className="min-h-[44px] inline-flex items-center border border-red-200 px-3 py-1.5 font-label text-xs uppercase tracking-[0.1em] text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {deletingId === p.id ? 'Removing…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm text-outline">
                  <p>
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="min-h-[44px] border border-outline-variant/30 px-4 py-2 font-label text-xs uppercase tracking-[0.1em] text-on-surface hover:bg-outline-variant/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="min-h-[44px] border border-outline-variant/30 px-4 py-2 font-label text-xs uppercase tracking-[0.1em] text-on-surface hover:bg-outline-variant/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
