'use client';

import { useEffect, useRef } from 'react';
import Image, { type ImageProps } from 'next/image';

type RevealImageProps = Omit<ImageProps, 'fill'> & {
  containerClassName?: string;
};

export default function RevealImage({ containerClassName = '', className = '', ...props }: RevealImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only run scroll reveal on touch devices (mobile)
    // Desktop uses hover via CSS group-hover
    if (window.matchMedia('(hover: hover)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view');
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-image absolute inset-0 ${containerClassName}`}
    >
      <Image
        {...props}
        fill
        className={`object-cover transition-transform duration-700 group-hover:scale-105 ${className}`}
      />
    </div>
  );
}
