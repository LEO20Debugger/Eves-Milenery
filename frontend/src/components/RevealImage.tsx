'use client';

import { useEffect, useRef } from 'react';
import Image, { type ImageProps } from 'next/image';

type RevealImageProps = Omit<ImageProps, 'fill' | 'className'> & {
  containerClassName?: string;
};

export default function RevealImage({ containerClassName = '', ...props }: RevealImageProps) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    // On desktop (hover capable) — CSS handles it via group-hover, no JS needed
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // Mobile: use IntersectionObserver for scroll reveal
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.filter = 'grayscale(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={imgRef}
      style={{ transition: 'filter 0.8s ease' }}
      className={`absolute inset-0 grayscale group-hover:grayscale-0 ${containerClassName}`}
    >
      <Image
        {...props}
        fill
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
      />
    </div>
  );
}
