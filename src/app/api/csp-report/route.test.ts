import { afterEach, describe, expect, it, mock } from 'bun:test';

const loadRoute = async (tag: string) => {
  const logWarnEvent = mock((...args: unknown[]) => {
    void args;
  });
  mock.module('@/lib/log-warn', () => ({
    logWarnEvent,
  }));

  const importedRoute = await import(`./route?${tag}-${Date.now()}`);
  return { POST: importedRoute.POST, logWarnEvent };
};

const parseJsonBody = (response: Response) => response.text();

describe('csp-report route', () => {
  afterEach(() => {
    mock.restore();
  });

  it('always returns 204 with no-store', async () => {
    const { POST } = await loadRoute('basic');

    const response = await POST(
      new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/csp-report',
          'x-forwarded-for': '203.0.113.10',
        },
        body: JSON.stringify({
          'csp-report': {
            'effective-directive': 'script-src',
            'blocked-uri': 'https://evil.example.com/x.js',
            'document-uri': 'https://example.com/articles/1',
          },
        }),
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    await parseJsonBody(response);
  });

  it('drops payloads over 32KB', async () => {
    const { POST, logWarnEvent } = await loadRoute('large-body');
    const largeBody = JSON.stringify({ payload: 'a'.repeat(33 * 1024) });

    const response = await POST(
      new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/csp-report',
          'x-forwarded-for': '203.0.113.11',
        },
        body: largeBody,
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(logWarnEvent).toHaveBeenCalledTimes(1);

    const event = (logWarnEvent.mock.calls.at(0)?.[0] ?? {}) as unknown as { event?: string };
    expect(event.event).toBe('csp_report_payload_too_large');
  });

  it('rejects too-large payloads using content-length before parsing body', async () => {
    const { POST, logWarnEvent } = await loadRoute('content-length-limit');

    const response = await POST(
      new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/csp-report',
          'content-length': String(32 * 1024 + 1),
          'x-forwarded-for': '203.0.113.20',
        },
        body: '{}',
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(logWarnEvent).toHaveBeenCalledTimes(1);
    const event = (logWarnEvent.mock.calls.at(0)?.[0] ?? {}) as unknown as { event?: string };
    expect(event.event).toBe('csp_report_payload_too_large');
  });

  it('enforces a 60 requests/minute rate limit per IP', async () => {
    const { POST, logWarnEvent } = await loadRoute('rate-limit');
    const payload = JSON.stringify({
      'csp-report': {
        'effective-directive': 'script-src',
        'blocked-uri': 'https://evil.example.com/a.js',
        'document-uri': 'https://example.com/',
      },
    });

    for (let i = 0; i < 61; i += 1) {
      const response = await POST(
        new Request('https://example.com/api/csp-report', {
          method: 'POST',
          headers: {
            'content-type': 'application/csp-report',
            'x-forwarded-for': '203.0.113.12',
          },
          body: payload,
        }),
      );

      expect(response.status).toBe(204);
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    }

    expect(logWarnEvent).toHaveBeenCalledTimes(60);
  });

  it('normalizes URIs to origins and builds dedupeKey with unit separator', async () => {
    const { POST, logWarnEvent } = await loadRoute('normalize');

    await POST(
      new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/csp-report',
          'x-forwarded-for': '203.0.113.13',
        },
        body: JSON.stringify({
          'csp-report': {
            'effective-directive': 'script-src',
            'violated-directive': 'script-src-elem',
            'blocked-uri': 'https://evil.example.com/path?q=1',
            'document-uri': 'https://www.example.com/articles/post?utm=1',
            'source-file': 'https://cdn.example.com/assets/app.js?token=abc',
            'status-code': 200,
          },
        }),
      }),
    );

    const event = (logWarnEvent.mock.calls.at(0)?.[0] ?? {}) as unknown as {
      context?: {
        blockedUri?: string;
        documentUri?: string;
        sourceFile?: string;
        dedupeKey?: string;
      };
    };
    const context = event.context || {};

    expect(context.blockedUri).toBe('https://evil.example.com');
    expect(context.documentUri).toBe('https://www.example.com');
    expect(context.sourceFile).toBe('https://cdn.example.com');
    expect(context.dedupeKey).toBe('script-src\u001Fhttps://evil.example.com\u001Fhttps://www.example.com');
  });

  it('accepts application/reports+json payloads with body camelCase fields', async () => {
    const { POST, logWarnEvent } = await loadRoute('reports-json');

    const response = await POST(
      new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'application/reports+json',
          'x-forwarded-for': '203.0.113.14',
        },
        body: JSON.stringify([
          {
            type: 'csp-violation',
            body: {
              effectiveDirective: 'img-src',
              blockedURL: 'data:image/png;base64,abc',
              documentURL: 'https://example.com/articles',
              sourceFile: 'https://cdn.example.com/main.js?token=abc',
              statusCode: 200,
            },
          },
        ]),
      }),
    );

    expect(response.status).toBe(204);
    const event = (logWarnEvent.mock.calls.at(0)?.[0] ?? {}) as unknown as {
      context?: {
        blockedUri?: string;
        documentUri?: string;
        sourceFile?: string;
        effectiveDirective?: string;
        dedupeKey?: string;
      };
    };
    expect(event.context?.blockedUri).toBe('data:');
    expect(event.context?.documentUri).toBe('https://example.com');
    expect(event.context?.sourceFile).toBe('https://cdn.example.com');
    expect(event.context?.effectiveDirective).toBe('img-src');
    expect(event.context?.dedupeKey).toBe('img-src\u001Fdata:\u001Fhttps://example.com');
  });

  it('ignores unsupported content types and still returns 204', async () => {
    const { POST, logWarnEvent } = await loadRoute('unsupported-content-type');

    const response = await POST(
      new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
          'x-forwarded-for': '203.0.113.15',
        },
        body: 'not-a-csp-payload',
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(logWarnEvent).toHaveBeenCalledTimes(0);
  });

  it('ignores requests without content-type and still returns 204', async () => {
    const { POST, logWarnEvent } = await loadRoute('missing-content-type');

    const response = await POST(
      new Request('https://example.com/api/csp-report', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '203.0.113.16',
        },
        body: JSON.stringify({
          'csp-report': {
            'effective-directive': 'script-src',
            'blocked-uri': 'https://evil.example.com/x.js',
            'document-uri': 'https://example.com/',
          },
        }),
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(logWarnEvent).toHaveBeenCalledTimes(0);
  });
});
