import { logWarnEvent } from '@/lib/log-warn';

const VALID_CSP_MODES = new Set(['report-only', 'enforce']);
const REPORT_ONLY_MODE = 'report-only';

export const CSP_NONCE_HEADER = 'x-csp-nonce';
export const CSP_REPORT_GROUP = 'csp-endpoint';
export const CSP_REPORT_MAX_AGE_SECONDS = 86400;

let hasLoggedInvalidCspMode = false;

export type CspMode = 'report-only' | 'enforce';

type BuildCspHeaderValueOptions = {
  nonce: string;
  isProduction: boolean;
};

export const resolveCspMode = (value: string | undefined = process.env.CSP_MODE): CspMode => {
  if (!value) {
    return REPORT_ONLY_MODE;
  }

  const normalized = value.trim().toLowerCase();
  if (VALID_CSP_MODES.has(normalized)) {
    return normalized as CspMode;
  }

  if (!hasLoggedInvalidCspMode) {
    hasLoggedInvalidCspMode = true;
    logWarnEvent({
      event: 'csp_mode_invalid',
      reason: 'unsupported_value',
      context: { value: normalized, fallback: REPORT_ONLY_MODE },
    });
  }

  return REPORT_ONLY_MODE;
};

const NONCE_BYTES_LENGTH = 24;

const encodeBase64Url = (bytes: Uint8Array): string => {
  if (typeof btoa === 'function') {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
  }

  return Buffer.from(bytes).toString('base64url');
};

export const createCspNonce = (): string => {
  const bytes = new Uint8Array(NONCE_BYTES_LENGTH);
  globalThis.crypto.getRandomValues(bytes);
  return encodeBase64Url(bytes);
};

export const buildCspHeaderValue = ({
  nonce,
  isProduction,
}: BuildCspHeaderValueOptions): string => {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.microcms-assets.io",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    'report-uri /api/csp-report',
    `report-to ${CSP_REPORT_GROUP}`,
  ];

  if (isProduction) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
};
