'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

interface SafeImageProps extends ImageProps {
  fallbackSrc?: ImageProps['src'];
  fallbackAlt?: string;
}

export function SafeImage({
  src,
  fallbackSrc = '/placeholder.svg',
  fallbackAlt,
  onError,
  alt,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<ImageProps['src']>(src);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setIsFallback(false);
  }, [src]);

  const resolvedAlt = isFallback && fallbackAlt ? fallbackAlt : alt;

  return (
    <Image
      {...props}
      alt={resolvedAlt}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
          setIsFallback(true);
        }
        if (onError) {
          onError(event);
        }
      }}
    />
  );
}
