import { afterEach, describe, expect, it } from 'bun:test';
import sitemap, { buildSitemap } from './sitemap';

const ORIGINAL_CONSOLE_ERROR = console.error;
const STATIC_ROUTE_PATHS = ['/', '/projects', '/articles', '/about', '/contact'];

afterEach(() => {
  console.error = ORIGINAL_CONSOLE_ERROR;
});

describe('sitemap', () => {
  it('keeps a Next.js-compatible default export signature', () => {
    expect(sitemap.length).toBe(0);
  });

  it('throws in production when article loading fails', async () => {
    console.error = () => {};
    await expect(
      buildSitemap(async () => {
        throw new Error('microcms unavailable');
      }, { isProduction: true }),
    ).rejects.toThrow('microcms unavailable');
  });

  it('returns static routes in non-production when article loading fails', async () => {
    console.error = () => {};
    const entries = await buildSitemap(async () => {
      throw new Error('microcms unavailable');
    }, { isProduction: false });
    const pathnames = entries.map((entry) => new URL(entry.url).pathname);
    expect(pathnames).toEqual(STATIC_ROUTE_PATHS);
  });
});
