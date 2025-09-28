import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { PostSchema } from '../src/lib/schemas';

process.env.MICROCMS_SERVICE_DOMAIN ??= 'demo';
process.env.MICROCMS_API_KEY ??= 'test-key';

const { getPosts } = await import('../src/lib/cms');

const basePost = {
  id: 'sample-id',
  title: 'Sample Post',
  slug: 'sample-post',
  excerpt: 'A short summary',
  publishedAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  ogp_image: {
    url: 'https://example.com/ogp.png',
    height: 630,
    width: 1200,
  },
  authors: {
    id: 'author-1',
    name: 'Author One',
    image: {
      url: 'https://example.com/avatar.png',
      height: 100,
      width: 100,
    },
  },
  tags: [
    {
      id: 'tag-1',
      name: 'Tag One',
      slug: 'tag-one',
    },
  ],
  custom_body: {
    blog_body: '<p>Hello world</p>',
    related_blogs: [
      {
        id: 'related-id',
        title: 'Related Post',
        slug: 'related-post',
        excerpt: 'Related summary',
        publishedAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        ogp_image: {
          url: 'https://example.com/related.png',
          height: 630,
          width: 1200,
        },
        authors: {
          id: 'author-2',
          name: 'Author Two',
          image: {
            url: 'https://example.com/avatar-2.png',
            height: 100,
            width: 100,
          },
        },
        tags: [
          {
            id: 'tag-2',
            name: 'Tag Two',
            slug: 'tag-two',
          },
        ],
        custom_body: {
          body: '<p>Related body</p>',
        },
      },
    ],
  },
};

const listPayload = {
  contents: [basePost],
  totalCount: 1,
  limit: 10,
  offset: 0,
};

const originalFetch: typeof fetch = global.fetch;

describe('schemas', () => {
  it('parses a valid post payload', () => {
    const result = PostSchema.parse(basePost);
    expect(result.id).toBe('sample-id');
  });

  it('rejects invalid post payloads', () => {
    const invalidPayload = { ...basePost, title: undefined } as unknown;
    expect(() => PostSchema.parse(invalidPayload)).toThrow();
  });
});

describe('cms client', () => {
  beforeEach(() => {
    global.fetch = (() =>
      Promise.resolve(
        new Response(JSON.stringify(listPayload), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      )) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('normalizes list responses into items and totalCount', async () => {
    const result = await getPosts({ limit: 1 });

    expect(result.totalCount).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'sample-id',
      title: 'Sample Post',
      relatedPosts: [
        expect.objectContaining({
          id: 'related-id',
          title: 'Related Post',
        }),
      ],
    });
  });
});
