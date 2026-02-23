import {
  CSP_REPORT_GROUP,
  CSP_REPORT_MAX_AGE_SECONDS,
  buildCspHeaderValue,
  resolveCspMode,
} from '@/lib/csp';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const HTML_MIME = 'text/html';
const NAVIGATE_MODE = 'navigate';
const DOCUMENT_DEST = 'document';
const ALLOWED_METHODS = new Set(['GET', 'HEAD']);

export const shouldApplyCsp = (request: Pick<NextRequest, 'method' | 'headers'>): boolean => {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  if (!ALLOWED_METHODS.has(request.method)) {
    return false;
  }

  const accept = request.headers.get('accept');
  if (accept) {
    return accept.toLowerCase().includes(HTML_MIME);
  }

  const fetchDest = request.headers.get('sec-fetch-dest')?.toLowerCase();
  if (fetchDest === DOCUMENT_DEST) {
    return true;
  }

  const fetchMode = request.headers.get('sec-fetch-mode')?.toLowerCase();
  return fetchMode === NAVIGATE_MODE;
};

export function proxy(request: NextRequest) {
  if (!shouldApplyCsp(request)) {
    return NextResponse.next();
  }

  const mode = resolveCspMode();
  const cspValue = buildCspHeaderValue({
    isProduction: process.env.NODE_ENV === 'production',
    mode,
  });

  const response = NextResponse.next();

  const reportEndpoint = new URL('/api/csp-report', request.nextUrl.origin).toString();
  response.headers.set(
    'Report-To',
    JSON.stringify({
      group: CSP_REPORT_GROUP,
      max_age: CSP_REPORT_MAX_AGE_SECONDS,
      endpoints: [{ url: reportEndpoint }],
    }),
  );
  response.headers.set('Reporting-Endpoints', `${CSP_REPORT_GROUP}="${reportEndpoint}"`);

  if (mode === 'enforce') {
    response.headers.set('Content-Security-Policy', cspValue);
  } else {
    response.headers.set('Content-Security-Policy-Report-Only', cspValue);
  }

  return response;
}

export const config: import('next/server').ProxyConfig = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt).*)'],
};
