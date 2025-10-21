const DEFAULT_SITE_NAME = 'tech-blog-application-bun';
const DEFAULT_DESCRIPTION =
  'A modern tech blog for sharing knowledge and insights on web development, programming, and technology and quality assurance.';
const DEFAULT_KEYWORDS = [
  'tech-blog-application-bun',
  'web development',
  'programming',
  'technology',
  'quality assurance',
];
const DEFAULT_OG_IMAGE_PATH = '/placeholder.jpg';
const DEFAULT_LOCALE = 'ja_JP';
const DEFAULT_FEED_PATH = '/feed.xml';
export const SITE_TITLE_TEMPLATE = `%s | ${DEFAULT_SITE_NAME}`;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const normalizeHostname = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/+$/, '');

const resolveSiteUrl = () => {
  const urlFromEnv = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();

  if (urlFromEnv) {
    return trimTrailingSlash(urlFromEnv);
  }

  if (process.env.NODE_ENV === 'production') {
    const vercelUrl = (process.env.VERCEL_URL || '').trim();
    if (vercelUrl) {
      return `https://${normalizeHostname(vercelUrl)}`;
    }

    throw new Error(
      'Site URL is not set. Please configure NEXT_PUBLIC_SITE_URL or VERCEL_URL.',
    );
  }

  return 'http://localhost:3000';
};

export const siteMetadata = {
  name: DEFAULT_SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  url: resolveSiteUrl(),
  locale: DEFAULT_LOCALE,
  feedPath: DEFAULT_FEED_PATH,
  twitter: {
    site: '@tech_blog_application_bun',
    creator: '@tech_blog_application_bun',
    cardType: 'summary_large_image' as const,
  },
  defaultOgImagePath: DEFAULT_OG_IMAGE_PATH,
};

export const metadataBase = new URL(siteMetadata.url);

export const absoluteUrl = (path = '/') => {
  try {
    return new URL(path, metadataBase).toString();
  } catch (error) {
    console.error('Failed to resolve absolute URL for path:', path, error);
    return path;
  }
};

export const feedUrl = absoluteUrl(siteMetadata.feedPath);

export const buildOgImage = (
  imageUrl?: string,
  altText?: string,
  dimensions: { width?: number; height?: number } = {},
) => {
  const url = imageUrl ? absoluteUrl(imageUrl) : absoluteUrl(siteMetadata.defaultOgImagePath);
  const alt = altText || siteMetadata.name;

  return {
    url,
    width: dimensions.width ?? 1200,
    height: dimensions.height ?? 630,
    alt,
  };
};
