interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
}

interface ReviewListProps {
  reviews: Review[];
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`${dim} ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
  const rounded = Math.round(avg * 10) / 10;

  return (
    <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
      <span className="text-4xl font-bold text-gray-900">{rounded.toFixed(1)}</span>
      <div>
        <StarRating rating={Math.round(avg)} size="lg" />
        <p className="mt-1 text-sm text-gray-500">
          {total} {total === 1 ? 'review' : 'reviews'}
        </p>
      </div>
    </div>
  );
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product.</p>
    );
  }

  return (
    <div>
      <RatingSummary reviews={reviews} />
      <ul className="space-y-4" aria-label="Customer reviews">
        {reviews.map((review) => (
          <li key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <StarRating rating={review.rating} />
              <time
                dateTime={new Date(review.createdAt).toISOString()}
                className="text-xs text-gray-400"
              >
                {new Date(review.createdAt).toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
