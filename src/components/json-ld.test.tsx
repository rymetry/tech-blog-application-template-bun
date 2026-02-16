import { afterEach, describe, expect, it } from 'bun:test';

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;
const ORIGINAL_WARN = console.warn;

afterEach(() => {
  process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  console.warn = ORIGINAL_WARN;
});

describe('JsonLd', () => {
  it('throws in non-production when JSON.stringify fails', async () => {
    process.env.NODE_ENV = 'development';
    const { JsonLd } = await import(`./json-ld?dev=${Date.now()}`);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(() => JsonLd({ data: circular })).toThrow();
  });

  it('returns null and logs warning in production when stringify fails', async () => {
    process.env.NODE_ENV = 'production';
    console.warn = () => {};
    const { JsonLd } = await import(`./json-ld?prod=${Date.now()}`);
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    const element = JsonLd({ data: circular });
    expect(element).toBeNull();
  });
});
