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
