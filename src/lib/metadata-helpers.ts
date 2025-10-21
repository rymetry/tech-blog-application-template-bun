import type { Metadata } from 'next';
import type { ArticlePost } from '@/types';
import { SITE_TITLE_TEMPLATE, absoluteUrl, buildOgImage, siteMetadata } from '@/lib/metadata';
import { truncateForSEO } from '@/lib/utils';

export interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  alternates?: Metadata['alternates'];
}

interface BaseMetadataOptions extends PageMetadataOptions {
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  authors?: string[];
}

const normalizePath = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (!path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
};

const createBaseMetadata = ({
  title,
  description,
  path,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  tags,
  authors,
  alternates,
}: BaseMetadataOptions): Metadata => {
  const normalizedPath = normalizePath(path);
  const canonicalUrl = absoluteUrl(normalizedPath);
  const truncatedDescription = truncateForSEO(description ?? siteMetadata.description);
  const metadataTitle = title ? SITE_TITLE_TEMPLATE.replace('%s', title) : siteMetadata.name;
  const ogImage = buildOgImage(image, title);

  return {
    title: metadataTitle,
    description: truncatedDescription,
    alternates: {
      canonical: canonicalUrl,
      ...(alternates ?? {}),
    },
    openGraph: {
      type,
      locale: siteMetadata.locale,
      siteName: siteMetadata.name,
      title: metadataTitle,
      description: truncatedDescription,
      url: canonicalUrl,
      images: [ogImage],
      ...(type === 'article'
        ? {
            publishedTime,
            modifiedTime,
            authors,
            tags,
          }
        : {}),
    },
    twitter: {
      card: siteMetadata.twitter.cardType,
      site: siteMetadata.twitter.site,
      creator: siteMetadata.twitter.creator,
      title: metadataTitle,
      description: truncatedDescription,
      images: [
        {
          url: ogImage.url,
          alt: ogImage.alt,
        },
      ],
    },
  };
};

/**
 * ページのメタデータを生成します
 * @param options - メタデータオプション
 * @returns Next.js Metadata オブジェクト
 * @example
 * const metadata = createPageMetadata({
 *   title: 'About',
 *   description: 'About page',
 *   path: '/about',
 * });
 */
export const createPageMetadata = (options: PageMetadataOptions): Metadata =>
  createBaseMetadata({ ...options });

export interface ArticleMetadataOptions {
  article: ArticlePost;
  path?: string;
}

export const createArticleMetadata = ({ article, path }: ArticleMetadataOptions): Metadata => {
  const description = article.excerpt || '';
  const image = article.coverImage?.url;
  const articlePath = path ?? `/articles/${article.slug}`;
  const tags = article.tags?.map((tag) => tag.name).filter(Boolean);
  const authors = article.author?.name ? [article.author.name] : undefined;

  return createBaseMetadata({
    title: article.title,
    description,
    path: articlePath,
    image,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    tags,
    authors,
  });
};
