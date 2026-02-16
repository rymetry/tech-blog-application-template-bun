import { describe, expect, it } from 'bun:test';
import { normalizeSafeRedirectPath } from './safe-redirect';

const expectRelativePath = (path: string) => {
  expect(path.startsWith('/')).toBe(true);
  expect(path.startsWith('//')).toBe(false);
  expect(path.startsWith('http://')).toBe(false);
  expect(path.startsWith('https://')).toBe(false);
};

describe('safe-redirect', () => {
  it('normalizes internal relative paths', () => {
    expect(normalizeSafeRedirectPath(' articles/test ')).toBe('/articles/test');
    expect(normalizeSafeRedirectPath('/articles/test')).toBe('/articles/test');
  });

  it('rejects external redirect payloads', () => {
    expect(normalizeSafeRedirectPath('https://evil.example.com')).toBe('/');
    expect(normalizeSafeRedirectPath('//evil.example.com')).toBe('/');
    expect(normalizeSafeRedirectPath('/foo%5Cbar')).toBe('/');
    expect(normalizeSafeRedirectPath('/foo\\bar')).toBe('/');
    expect(normalizeSafeRedirectPath('%2F%2Fevil.example.com')).toBe('/');
    expect(
      normalizeSafeRedirectPath('https://evil.example.com/articles/foo', {
        allowedOrigin: 'https://example.com',
      }),
    ).toBe('/');
  });

  it('allows same-origin absolute URLs when allowedOrigin is provided', () => {
    expect(
      normalizeSafeRedirectPath('https://example.com/articles/foo?draft=1', {
        allowedOrigin: 'https://example.com',
      }),
    ).toBe('/articles/foo?draft=1');
  });

  it('rejects protocol-relative paths derived from same-origin absolute URLs', () => {
    expect(
      normalizeSafeRedirectPath('https://example.com//@evil.com', {
        allowedOrigin: 'https://example.com',
      }),
    ).toBe('/');
  });

  it('removes control characters and enforces max input length', () => {
    const withControl = normalizeSafeRedirectPath('\u0000/articles\u001f/test');
    expect(withControl).toBe('/articles/test');

    const longPath = `/${'a'.repeat(4000)}`;
    const normalized = normalizeSafeRedirectPath(longPath);
    expect(normalized.length).toBeLessThanOrEqual(2048);
  });

  it('keeps double-encoded external payloads as relative paths', () => {
    const protocolRelative = normalizeSafeRedirectPath('%252F%252Fevil.example.com');
    const schemeLike = normalizeSafeRedirectPath('%2568ttps://evil.example.com');

    expectRelativePath(protocolRelative);
    expectRelativePath(schemeLike);
  });
});
