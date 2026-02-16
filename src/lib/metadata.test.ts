import { afterEach, describe, expect, it } from 'bun:test';
import { resolveSiteUrlForEnv } from './metadata';

const originalWarn = console.warn;

afterEach(() => {
  console.warn = originalWarn;
});

describe('metadata site url resolution', () => {
  it('fails fast in production when site url is missing', () => {
    expect(() =>
      resolveSiteUrlForEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: '',
        VERCEL_URL: '',
      }),
    ).toThrow();
  });

  it('rejects localhost in production without override', () => {
    expect(() =>
      resolveSiteUrlForEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      }),
    ).toThrow();
  });

  it('rejects localhost override on CI or Vercel', () => {
    expect(() =>
      resolveSiteUrlForEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        ALLOW_LOCALHOST_SITE_URL_FOR_BUILD: '1',
        CI: 'true',
      }),
    ).toThrow();

    expect(() =>
      resolveSiteUrlForEnv({
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        ALLOW_LOCALHOST_SITE_URL_FOR_BUILD: '1',
        VERCEL: '1',
      }),
    ).toThrow();
  });

  it('allows localhost override only for local verification and records callback', () => {
    console.warn = () => {};
    const callbackCalls: Array<{ host: string }> = [];

    const url = resolveSiteUrlForEnv(
      {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
        ALLOW_LOCALHOST_SITE_URL_FOR_BUILD: '1',
      },
      {
        onLocalhostOverrideUsed: (context) => {
          callbackCalls.push(context);
        },
      },
    );

    expect(url).toBe('http://localhost:3000');
    expect(callbackCalls).toEqual([{ host: 'localhost:3000' }]);
  });

  it('treats SITE_URL as unsupported', () => {
    expect(() =>
      resolveSiteUrlForEnv({
        NODE_ENV: 'production',
        SITE_URL: 'https://example.com',
      }),
    ).toThrow();
  });
});
