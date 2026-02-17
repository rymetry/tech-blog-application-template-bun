import { CSP_NONCE_HEADER } from '@/lib/csp';
import { afterEach, describe, expect, it, mock } from 'bun:test';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const setNodeEnv = (value: string | undefined) => {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
};

afterEach(() => {
  setNodeEnv(ORIGINAL_NODE_ENV);
  mock.restore();
});

const mockNextHeaders = (headersInit?: HeadersInit) => {
  mock.module('next/headers', () => ({
    headers: async () => new Headers(headersInit),
    draftMode: async () => ({
      isEnabled: false,
      enable: () => {},
      disable: () => {},
    }),
  }));
};

describe('JsonLd', () => {
  it('throws in non-production when JSON.stringify fails', async () => {
    setNodeEnv('development');
    mockNextHeaders();
    const { JsonLd } = await import(`./json-ld?dev=${Date.now()}`);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    await expect(JsonLd({ data: circular })).rejects.toThrow();
  });

  it('returns null and logs warning in production when stringify fails', async () => {
    setNodeEnv('production');
    const logWarnEvent = mock(() => {});
    mockNextHeaders();
    mock.module('@/lib/log-warn', () => ({
      logWarnEvent,
    }));
    const { JsonLd } = await import(`./json-ld?prod=${Date.now()}`);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const element = await JsonLd({ data: circular });
    expect(element).toBeNull();
    expect(logWarnEvent).toHaveBeenCalledTimes(1);
  });

  it('applies the explicit nonce when passed', async () => {
    setNodeEnv('production');
    mockNextHeaders();
    const { JsonLd } = await import(`./json-ld?nonce-prop=${Date.now()}`);

    const element = await JsonLd({
      data: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test Site' },
      nonce: 'nonce-from-prop',
    });

    expect(element?.props.nonce).toBe('nonce-from-prop');
  });

  it('uses the request nonce when nonce prop is omitted', async () => {
    setNodeEnv('production');
    mockNextHeaders([[CSP_NONCE_HEADER, 'nonce-from-header']]);
    const { JsonLd } = await import(`./json-ld?nonce-header=${Date.now()}`);

    const element = await JsonLd({
      data: { '@context': 'https://schema.org', '@type': 'WebPage', name: 'Top' },
    });

    expect(element?.props.nonce).toBe('nonce-from-header');
  });
});
