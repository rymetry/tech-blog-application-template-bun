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
});

afterEach(() => {
  mock.restore();
  resetEnv();
});

describe('csp utils', () => {
  it('defaults to report-only mode when CSP_MODE is not set', async () => {
    delete process.env.CSP_MODE;
    const { resolveCspMode } = await import(`./csp?default=${Date.now()}`);
    expect(resolveCspMode()).toBe('report-only');
  });

  it('logs invalid CSP_MODE only once per worker instance', async () => {
    const logWarnEvent = mock(() => {});
    mock.module('@/lib/log-warn', () => ({
      logWarnEvent,
    }));

    process.env.CSP_MODE = 'invalid-mode';
    const { resolveCspMode } = await import(`./csp?invalid=${Date.now()}`);

    expect(resolveCspMode()).toBe('report-only');
    expect(resolveCspMode('also-invalid')).toBe('report-only');
    expect(logWarnEvent).toHaveBeenCalledTimes(1);
  });

  it('creates high-entropy nonce in base64url format', async () => {
    const { createCspNonce } = await import(`./csp?nonce=${Date.now()}`);
    const nonce = createCspNonce();

    expect(nonce.length).toBe(32);
    expect(nonce).toMatch(/^[A-Za-z0-9_-]{32}$/);
  });

  it('includes report-uri and report-to directives, and production upgrade directive', async () => {
    const { buildCspHeaderValue } = await import(`./csp?header=${Date.now()}`);
    const reportOnlyValue = buildCspHeaderValue({
      nonce: 'abc123',
      isProduction: false,
    });
    const productionValue = buildCspHeaderValue({
      nonce: 'abc123',
      isProduction: true,
    });

    expect(reportOnlyValue).toContain('report-uri /api/csp-report');
    expect(reportOnlyValue).toContain('report-to csp-endpoint');
    expect(reportOnlyValue).not.toContain('upgrade-insecure-requests');
    expect(productionValue).toContain('upgrade-insecure-requests');
  });
});
