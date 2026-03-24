'use client';

import { useEffect, useState } from 'react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  userName: string;
  userEmail: string;
  productName: string;
  productSlug: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={s <= rating ? 'text-yellow-500' : 'text-gray-300'} aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setReviews(data); setLoading(false); })
      .catch(() => { setError('Failed to load reviews'); setLoading(false); });
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-headline text-2xl mb-8">All Reviews</h1>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="py-3 pr-4 font-label text-[10px] uppercase tracking-widest text-gray-500">Product</th>
                <th className="py-3 pr-4 font-label text-[10px] uppercase tracking-widest text-gray-500">Customer</th>
                <th className="py-3 pr-4 font-label text-[10px] uppercase tracking-widest text-gray-500">Stars</th>
                <th className="py-3 pr-4 font-label text-[10px] uppercase tracking-widest text-gray-500">Comment</th>
                <th className="py-3 font-label text-[10px] uppercase tracking-widest text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 pr-4 font-medium">{r.productName}</td>
                  <td className="py-4 pr-4">
                    <p>{r.userName}</p>
                    <p className="text-xs text-gray-400">{r.userEmail}</p>
                  </td>
                  <td className="py-4 pr-4"><Stars rating={r.rating} /></td>
                  <td className="py-4 pr-4 max-w-xs text-gray-600">{r.comment}</td>
                  <td className="py-4 text-gray-400 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
