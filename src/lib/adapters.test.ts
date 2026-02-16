import { describe, expect, it } from 'bun:test';
import { adaptArticle } from './adapters';
import type { Article } from './microcms';

const createArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 'article-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  publishedAt: '2024-01-02T00:00:00.000Z',
  revisedAt: '2024-01-02T00:00:00.000Z',
  title: 'Article Title',
  slug: 'article-title',
  ...overrides,
});

describe('adaptArticle', () => {
  it('uses custom_body.body when article_body is missing', () => {
    const article = createArticle({
      custom_body: {
        fieldId: 'custom-body',
        body: '<p>Main body fallback</p>',
      },
    });

    const adapted = adaptArticle(article);
    expect(adapted.content).toBe('<p>Main body fallback</p>');
  });

  it('uses the same body fallback order for related posts', () => {
    const related = createArticle({
      id: 'related-1',
      title: 'Related',
      slug: 'related',
      custom_body: {
        fieldId: 'related-custom-body',
        body: '<p>Related body fallback</p>',
      },
    });
    const article = createArticle({
      custom_body: {
        fieldId: 'main-custom-body',
        related_articles: [related],
      },
    });

    const adapted = adaptArticle(article);
    expect(adapted.relatedPosts?.[0]?.content).toBe('<p>Related body fallback</p>');
  });
});
