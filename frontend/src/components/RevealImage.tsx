'use client';

import Image, { type ImageProps } from 'next/image';

type RevealImageProps = Omit<ImageProps, 'fill' | 'className'> & {
  containerClassName?: string;
};

export default function RevealImage({ containerClassName = '', ...props }: RevealImageProps) {
  return (
    <div className={`absolute inset-0 ${containerClassName}`}>
      <Image
        {...props}
        fill
        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
      />
    </div>
  );
}
