import { logWarnEvent } from '@/lib/log-warn';

const VALID_CSP_MODES = new Set(['report-only', 'enforce']);
const REPORT_ONLY_MODE = 'report-only';

export const CSP_REPORT_GROUP = 'csp-endpoint';
export const CSP_REPORT_MAX_AGE_SECONDS = 86400;

let hasLoggedInvalidCspMode = false;

export type CspMode = 'report-only' | 'enforce';

type BuildCspHeaderValueOptions = {
  isProduction: boolean;
  mode: CspMode;
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

export const buildCspHeaderValue = ({
  isProduction,
  mode,
}: BuildCspHeaderValueOptions): string => {
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
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

  if (isProduction && mode === 'enforce') {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
};
