import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import type { NextRequest } from 'next/server';
import { NextRequest as NextServerRequest } from 'next/server';

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

const setNodeEnv = (value: string | undefined) => {
  Object.defineProperty(process.env, 'NODE_ENV', {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
};

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

const makeRequestLike = (method: string, headers: HeadersInit): Pick<NextRequest, 'method' | 'headers'> => ({
  method,
  headers: new Headers(headers),
});

beforeEach(() => {
  resetEnv();
});

afterEach(() => {
  mock.restore();
  resetEnv();
  setNodeEnv(ORIGINAL_NODE_ENV);
});

describe('middleware CSP', () => {
  it('applies HTML detection with case-insensitive Accept', async () => {
    setNodeEnv('production');
    const { shouldApplyCsp } = await import(`./middleware?accept=${Date.now()}`);

    const applies = shouldApplyCsp(
      makeRequestLike('GET', { Accept: 'TEXT/HTML,application/xhtml+xml' }),
    );

    expect(applies).toBe(true);
  });

  it('falls back to sec-fetch headers when Accept is missing', async () => {
    setNodeEnv('production');
    const { shouldApplyCsp } = await import(`./middleware?fallback=${Date.now()}`);

    expect(
      shouldApplyCsp(
        makeRequestLike('GET', {
          'sec-fetch-dest': 'document',
        }),
      ),
    ).toBe(true);
    expect(
      shouldApplyCsp(
        makeRequestLike('HEAD', {
          'sec-fetch-mode': 'NAVIGATE',
        }),
      ),
    ).toBe(true);
  });

  it('applies only to GET/HEAD in production', async () => {
    setNodeEnv('production');
    const { shouldApplyCsp } = await import(`./middleware?methods=${Date.now()}`);

    expect(shouldApplyCsp(makeRequestLike('GET', { accept: 'text/html' }))).toBe(true);
    expect(shouldApplyCsp(makeRequestLike('HEAD', { accept: 'text/html' }))).toBe(true);
    expect(shouldApplyCsp(makeRequestLike('POST', { accept: 'text/html' }))).toBe(false);

    setNodeEnv('development');
    expect(shouldApplyCsp(makeRequestLike('GET', { accept: 'text/html' }))).toBe(false);
  });

  it('sets absolute CSP reporting endpoints', async () => {
    setNodeEnv('production');
    process.env.CSP_MODE = 'report-only';
    const { middleware } = await import(`./middleware?headers=${Date.now()}`);

    const request = new NextServerRequest('https://example.com/articles', {
      method: 'GET',
      headers: {
        accept: 'text/html',
      },
    });
    const response = middleware(request);

    const reportTo = response.headers.get('Report-To');
    expect(reportTo).toBeTruthy();
    const parsedReportTo = JSON.parse(reportTo || '{}') as {
      endpoints?: Array<{ url?: string }>;
      max_age?: number;
    };

    expect(parsedReportTo.max_age).toBe(86400);
    expect(parsedReportTo.endpoints?.[0]?.url).toBe('https://example.com/api/csp-report');
    expect(response.headers.get('Reporting-Endpoints')).toBe(
      'csp-endpoint="https://example.com/api/csp-report"',
    );

    const cspReportOnly = response.headers.get('Content-Security-Policy-Report-Only');
    expect(cspReportOnly).toContain('report-uri /api/csp-report');
    expect(cspReportOnly).toContain('report-to csp-endpoint');
  });
});
