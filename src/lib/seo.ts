import type { BlogPost } from '@/types';

const DEFAULT_SITE_NAME = 'rymlab';
const DEFAULT_SITE_DESCRIPTION =
  'A modern tech blog for sharing knowledge and insights on web development, programming, technology, and quality assurance.';

function resolveSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

export function getSiteName() {
  return process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME;
}

export function getSiteDescription() {
  return process.env.NEXT_PUBLIC_SITE_DESCRIPTION || DEFAULT_SITE_DESCRIPTION;
}

export function getSiteUrl() {
  return resolveSiteUrl();
}

export function buildWebSiteJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: getSiteName(),
    url: siteUrl,
    description: getSiteDescription(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildBlogPostingJsonLd(post: BlogPost) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = new URL(`/blog/${post.slug}`, siteUrl).toString();

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage?.url ? [post.coverImage.url] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      '@type': 'Person',
      name: post.author?.name ?? 'Unknown Author',
    },
    publisher: {
      '@type': 'Organization',
      name: getSiteName(),
      logo: {
        '@type': 'ImageObject',
        url: new URL('/favicon.ico', siteUrl).toString(),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data);
}
