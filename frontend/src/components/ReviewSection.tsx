'use client';

import { useState, useEffect } from 'react';
import ReviewForm from './ReviewForm';

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));

    function onStorage() {
      setIsLoggedIn(!!localStorage.getItem('token'));
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-gray-500">
        <a href="/login" className="font-medium text-gray-900 underline underline-offset-2">
          Log in
        </a>{' '}
        to leave a review.
      </p>
    );
  }

  return <ReviewForm productId={productId} />;
}
