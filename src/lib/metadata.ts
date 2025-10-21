import type { Metadata } from 'next';
import { truncateForSEO } from '@/lib/utils';

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

export const buildOgImage = (imageUrl?: string, altText?: string) => {
  const url = imageUrl ? absoluteUrl(imageUrl) : absoluteUrl(siteMetadata.defaultOgImagePath);
  const alt = altText || siteMetadata.name;

  return {
    url,
    width: 1200,
    height: 630,
    alt,
  };
};

type MetadataBuilderOptions = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  imageUrl?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  authors?: string[];
};

export const buildPageMetadata = (options: MetadataBuilderOptions = {}): Metadata => {
  const {
    title,
    description,
    canonicalPath = '/',
    imageUrl,
    imageAlt,
    type = 'website',
    publishedTime,
    modifiedTime,
    tags,
    authors,
  } = options;

  const metadataTitle = title ? `${title} | ${siteMetadata.name}` : siteMetadata.name;
  const metadataDescription = truncateForSEO(description ?? siteMetadata.description);
  const canonicalUrl = absoluteUrl(canonicalPath);
  const ogImageAlt = imageAlt || title || siteMetadata.name;
  const ogImage = buildOgImage(imageUrl, ogImageAlt);

  return {
    title: metadataTitle,
    description: metadataDescription,
    alternates: {
      canonical: canonicalUrl,
      types: {
        'application/rss+xml': feedUrl,
      },
    },
    openGraph: {
      type,
      locale: siteMetadata.locale,
      siteName: siteMetadata.name,
      title: metadataTitle,
      description: metadataDescription,
      url: canonicalUrl,
      images: [ogImage],
      ...(type === 'article'
        ? {
            publishedTime,
            modifiedTime,
            authors: authors?.length ? authors : [siteMetadata.name],
            tags,
          }
        : {}),
    },
    twitter: {
      card: siteMetadata.twitter.cardType,
      site: siteMetadata.twitter.site,
      creator: siteMetadata.twitter.creator,
      title: metadataTitle,
      description: metadataDescription,
      images: [
        {
          url: ogImage.url,
          alt: ogImage.alt,
        },
      ],
    },
  };
};
