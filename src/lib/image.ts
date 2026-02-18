type MicroCmsImageFit = 'crop' | 'max';

type MicroCmsImageOptions = {
  width?: number;
  height?: number;
  fit?: MicroCmsImageFit;
};

const MICROCMS_IMAGE_HOST = 'images.microcms-assets.io';

export function getMicroCmsImageUrl(url: string, options: MicroCmsImageOptions = {}): string {
  if (!url) {
    return url;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return url;
  }

  if (parsedUrl.hostname !== MICROCMS_IMAGE_HOST) {
    return url;
  }

  if (options.width) {
    parsedUrl.searchParams.set('w', String(options.width));
  }

  if (options.height) {
    parsedUrl.searchParams.set('h', String(options.height));
  }

  if (options.fit) {
    parsedUrl.searchParams.set('fit', options.fit);
  }

  return parsedUrl.toString();
}

export function getOptimizedAvatarUrl(src: string, sizePx: number): string {
  const normalizedSize = Number.isFinite(sizePx) ? Math.max(16, Math.round(sizePx)) : 32;
  const targetSize = Math.min(512, normalizedSize * 2);
  return getMicroCmsImageUrl(src, { width: targetSize, height: targetSize, fit: 'crop' });
}
