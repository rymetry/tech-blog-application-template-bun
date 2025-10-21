import type { ArticlePost } from '@/types';
import { absoluteUrl, siteMetadata } from './metadata';

type BreadcrumbItem = {
  name: string;
  path: string;
};

// TODO(maintainers): replace with the actual logo path once assets are provisioned.
const DEFAULT_LOGO_PATH = '/placeholder-logo.png';

export const buildBreadcrumbJsonLd = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const buildArticleJsonLd = (article: ArticlePost) => {
  const keywords = article.tags?.map((tag) => tag.name).filter(Boolean) ?? [];

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(`/articles/${article.slug}`),
    },
    ...(article.author?.name && {
      author: {
        '@type': 'Person',
        name: article.author.name,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: siteMetadata.name,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(DEFAULT_LOGO_PATH),
      },
    },
    image: [
      {
        '@type': 'ImageObject',
        url: article.coverImage?.url ?? absoluteUrl(siteMetadata.defaultOgImagePath),
        width: article.coverImage?.width ?? 1200,
        height: article.coverImage?.height ?? 630,
      },
    ],
    ...(keywords.length > 0 ? { keywords } : {}),
  };
};

export const buildBlogListJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: siteMetadata.name,
  description: siteMetadata.description,
  url: absoluteUrl('/articles'),
  publisher: {
    '@type': 'Organization',
    name: siteMetadata.name,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(DEFAULT_LOGO_PATH),
    },
  },
});
