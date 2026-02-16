import { describe, expect, it } from 'bun:test';
import nextConfig from './next.config';

describe('next.config', () => {
  it('does not inject NEXT_PUBLIC_SITE_URL via env field', () => {
    expect((nextConfig as { env?: unknown }).env).toBeUndefined();
  });
});
