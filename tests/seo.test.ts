import { afterEach, describe, expect, it } from 'bun:test';

import { buildBlogPostingJsonLd, buildBreadcrumbJsonLd, buildWebSiteJsonLd, serializeJsonLd } from '../src/lib/seo';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('seo helpers', () => {
  it('builds WebSite JSON-LD using environment configuration', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    process.env.NEXT_PUBLIC_SITE_NAME = 'Example';
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION = 'Example description';

    const jsonLd = buildWebSiteJsonLd();

    expect(jsonLd['@type']).toBe('WebSite');
    expect(jsonLd.name).toBe('Example');
    expect(jsonLd.url).toBe('https://example.com');
    expect(jsonLd.potentialAction.target).toBe('https://example.com/blog?q={search_term_string}');
  });

  it('builds BlogPosting JSON-LD with canonical URL', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
    const jsonLd = buildBlogPostingJsonLd({
      id: 'post-id',
      title: 'My Post',
      slug: 'my-post',
      excerpt: 'Summary',
      publishedAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
      coverImage: {
        url: 'https://example.com/cover.jpg',
        width: 1200,
        height: 630,
      },
      author: {
        id: 'author-id',
        name: 'Author',
        image: {
          url: 'https://example.com/avatar.jpg',
          width: 100,
          height: 100,
        },
      },
      tags: [],
      content: '<p>Content</p>',
      relatedPosts: [],
    });

    expect(jsonLd['@type']).toBe('BlogPosting');
    expect(jsonLd.url).toBe('https://example.com/blog/my-post');
    expect(jsonLd.publisher.name).toBe('rymlab');
  });

  it('builds BreadcrumbList JSON-LD with ordered items', () => {
    const jsonLd = buildBreadcrumbJsonLd([
      { name: 'Home', url: 'https://example.com/' },
      { name: 'Blog', url: 'https://example.com/blog' },
    ]);

    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[1].name).toBe('Blog');
  });

  it('serializes JSON-LD to string', () => {
    const data = { '@type': 'Test' };
    expect(serializeJsonLd(data)).toBe(JSON.stringify(data));
  });
});
