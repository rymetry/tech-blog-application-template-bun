import { afterEach, describe, expect, it } from 'bun:test';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

type HeaderEntry = { key: string; value: string };
type RootHeaderConfig = {
  source: string;
  headers: HeaderEntry[];
};

const setNodeEnv = (value: string | undefined) => {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
};

const loadConfigHeaders = async (nodeEnv: string) => {
  setNodeEnv(nodeEnv);
  const importedConfig = await import(`./next.config?env=${nodeEnv}-${Date.now()}`);
  const headers = await importedConfig.default.headers?.();
  const typedHeaders = (headers || []) as RootHeaderConfig[];
  const rootHeaders = typedHeaders.find((entry: RootHeaderConfig) => entry.source === '/:path*');

  return new Map((rootHeaders?.headers || []).map((header: HeaderEntry) => [header.key, header.value]));
};

describe('next.config', () => {
  afterEach(() => {
    setNodeEnv(ORIGINAL_NODE_ENV);
  });

  it('does not inject NEXT_PUBLIC_SITE_URL via env field', async () => {
    const importedConfig = await import(`./next.config?env-field=${Date.now()}`);
    expect((importedConfig.default as { env?: unknown }).env).toBeUndefined();
  });

  it('always includes Permissions-Policy', async () => {
    const headers = await loadConfigHeaders('development');
    expect(headers.get('Permissions-Policy')).toBeTruthy();
  });

  it('adds HSTS only in production', async () => {
    const developmentHeaders = await loadConfigHeaders('development');
    const productionHeaders = await loadConfigHeaders('production');

    expect(developmentHeaders.get('Strict-Transport-Security')).toBeUndefined();
    expect(productionHeaders.get('Strict-Transport-Security')).toBe(
      'max-age=15552000; includeSubDomains',
    );
  });
});
