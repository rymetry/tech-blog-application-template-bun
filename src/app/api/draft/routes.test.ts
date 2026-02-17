import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

const ORIGINAL_ENV = { ...process.env };

const resetEnv = () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key];
    }
  }

  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    process.env[key] = value;
  }
};

beforeEach(() => {
  resetEnv();
  (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
});

afterEach(() => {
  mock.restore();
  resetEnv();
});

describe('draft routes', () => {
  it('enable route blocks external redirects and sets no-store', async () => {
    process.env.MICROCMS_PREVIEW_SECRET = 'secret123';
    const enableSpy = mock(() => {});

    mock.module('next/headers', () => ({
      draftMode: async () => ({
        enable: enableSpy,
        disable: mock(() => {}),
        isEnabled: false,
      }),
    }));

    const { GET } = await import(`./enable/route?case=${Date.now()}`);
    const response = await GET(
      new Request(
        'https://example.com/api/draft/enable?secret=secret123&path=https://evil.example.com',
      ),
    );

    const location = response.headers.get('location');

    expect(response.status).toBe(307);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(location).toBeTruthy();
    expect(new URL(location || 'https://example.com').pathname).toBe('/');
    expect(enableSpy).toHaveBeenCalledTimes(1);
  });

  it('enable route returns 401 with no-store on invalid secret', async () => {
    process.env.MICROCMS_PREVIEW_SECRET = 'secret123';

    mock.module('next/headers', () => ({
      draftMode: async () => ({
        enable: mock(() => {}),
        disable: mock(() => {}),
        isEnabled: false,
      }),
    }));

    const { GET } = await import(`./enable/route?invalid=${Date.now()}`);
    const response = await GET(
      new Request(
        'https://example.com/api/draft/enable?secret=invalid&path=/articles/foo',
      ),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('enable route allows same-origin absolute redirect paths', async () => {
    process.env.MICROCMS_PREVIEW_SECRET = 'secret123';

    mock.module('next/headers', () => ({
      draftMode: async () => ({
        enable: mock(() => {}),
        disable: mock(() => {}),
        isEnabled: false,
      }),
    }));

    const { GET } = await import(`./enable/route?same-origin=${Date.now()}`);
    const response = await GET(
      new Request(
        'https://example.com/api/draft/enable?secret=secret123&path=https://example.com/articles/foo?x=1',
      ),
    );

    const location = response.headers.get('location');
    const target = new URL(location || 'https://example.com');

    expect(response.status).toBe(307);
    expect(target.pathname).toBe('/articles/foo');
    expect(target.searchParams.get('x')).toBe('1');
  });

  it('disable route blocks external redirects and sets no-store', async () => {
    const disableSpy = mock(() => {});

    mock.module('next/headers', () => ({
      draftMode: async () => ({
        enable: mock(() => {}),
        disable: disableSpy,
        isEnabled: true,
      }),
    }));

    const { GET } = await import(`./disable/route?case=${Date.now()}`);
    const response = await GET(
      new Request(
        'https://example.com/api/draft/disable?path=https://evil.example.com',
      ),
    );

    const location = response.headers.get('location');

    expect(response.status).toBe(307);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(location).toBeTruthy();
    expect(new URL(location || 'https://example.com').pathname).toBe('/');
    expect(disableSpy).toHaveBeenCalledTimes(1);
  });

  it('disable route allows same-origin absolute redirect paths', async () => {
    const disableSpy = mock(() => {});

    mock.module('next/headers', () => ({
      draftMode: async () => ({
        enable: mock(() => {}),
        disable: disableSpy,
        isEnabled: true,
      }),
    }));

    const { GET } = await import(`./disable/route?same-origin=${Date.now()}`);
    const response = await GET(
      new Request(
        'https://example.com/api/draft/disable?path=https://example.com/articles/foo?x=1',
      ),
    );

    const location = response.headers.get('location');
    const target = new URL(location || 'https://example.com');

    expect(response.status).toBe(307);
    expect(target.pathname).toBe('/articles/foo');
    expect(target.searchParams.get('x')).toBe('1');
    expect(disableSpy).toHaveBeenCalledTimes(1);
  });
});
