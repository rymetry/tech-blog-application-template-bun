import { describe, expect, it } from 'bun:test';
import { buildArticlesPath } from './utils';

describe('buildArticlesPath', () => {
  it('applies updates.page even when resetPage is true', () => {
    const path = buildArticlesPath(
      new URLSearchParams('q=nextjs&page=2'),
      { page: 5 },
      { resetPage: true },
    );

    const url = new URL(path, 'https://example.com');
    expect(url.pathname).toBe('/articles');
    expect(url.searchParams.get('q')).toBe('nextjs');
    expect(url.searchParams.get('page')).toBe('5');
  });
});
