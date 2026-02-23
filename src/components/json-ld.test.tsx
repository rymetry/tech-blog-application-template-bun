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

describe('JsonLd', () => {
  it('throws in non-production when JSON.stringify fails', async () => {
    setNodeEnv('development');
    const { JsonLd } = await import(`./json-ld?dev=${Date.now()}`);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() => JsonLd({ data: circular })).toThrow();
  });

  it('returns null and logs warning in production when stringify fails', async () => {
    setNodeEnv('production');
    const logWarnEvent = mock(() => {});
    mock.module('@/lib/log-warn', () => ({
      logWarnEvent,
    }));
    const { JsonLd } = await import(`./json-ld?prod=${Date.now()}`);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const element = JsonLd({ data: circular });
    expect(element).toBeNull();
    expect(logWarnEvent).toHaveBeenCalledTimes(1);
  });

  it('renders valid JSON-LD with id', async () => {
    setNodeEnv('production');
    const { JsonLd } = await import(`./json-ld?id=${Date.now()}`);

    const element = JsonLd({
      data: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test Site' },
      id: 'test-jsonld',
    });

    expect(element?.props.id).toBe('test-jsonld');
    expect(element?.props.type).toBe('application/ld+json');
  });
});
