import { describe, expect, it } from 'bun:test';

import { handleRevalidate } from '../app/api/revalidate/handler';

describe('handleRevalidate', () => {
  it('returns 200 and triggers revalidation when secret matches', async () => {
    const revalidatedTags: string[] = [];
    const revalidatedPaths: string[] = [];

    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': 'secret',
      },
    });

    const response = await handleRevalidate(request, {
      expectedSecret: 'secret',
      revalidateTagFn: async (tag) => {
        revalidatedTags.push(tag);
      },
      revalidatePathFn: (path) => {
        revalidatedPaths.push(path);
      },
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true, revalidated: true });
    expect(revalidatedTags).toEqual(['posts', 'tags']);
    expect(revalidatedPaths).toEqual(['/', '/blog']);
  });

  it('returns 401 when secret is invalid', async () => {
    const request = new Request('http://localhost/api/revalidate', {
      method: 'POST',
      headers: {
        'x-revalidate-secret': 'wrong',
      },
    });

    const response = await handleRevalidate(request, {
      expectedSecret: 'secret',
      revalidateTagFn: async () => {},
      revalidatePathFn: () => {},
    });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });
});
