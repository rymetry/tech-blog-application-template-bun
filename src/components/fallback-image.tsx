'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

type FallbackImageProps = Omit<ImageProps, 'src'> & {
  src: ImageProps['src'];
  fallbackSrc?: ImageProps['src'];
};

export function FallbackImage({ src, fallbackSrc = '/placeholder.svg', alt, onError, ...rest }: FallbackImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      alt={alt}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}
