const MAX_REDIRECT_INPUT_LENGTH = 2048;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/g;
const ENCODED_BACKSLASH_PATTERN = /%5c/i;
const ABSOLUTE_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

type NormalizeSafeRedirectPathOptions = {
  allowedOrigin?: string;
  allowedOrigins?: string[];
};

const decodeOnce = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeOrigin = (value: string | undefined): string | null => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const resolveAllowedOrigins = (options: NormalizeSafeRedirectPathOptions): Set<string> => {
  const values = [
    ...(options.allowedOrigin ? [options.allowedOrigin] : []),
    ...(options.allowedOrigins ?? []),
  ];

  const origins = new Set<string>();

  for (const value of values) {
    const normalized = normalizeOrigin(value);
    if (normalized) {
      origins.add(normalized);
    }
  }

  return origins;
};

const getAbsoluteUrlCandidate = (sanitized: string, decoded: string): string | null => {
  if (ABSOLUTE_SCHEME_PATTERN.test(sanitized)) {
    return sanitized;
  }

  if (ABSOLUTE_SCHEME_PATTERN.test(decoded)) {
    return decoded;
  }

  return null;
};

const hasUnsafeBackslashToken = (value: string) =>
  value.includes('\\') || ENCODED_BACKSLASH_PATTERN.test(value);

export const normalizeSafeRedirectPath = (
  input: string | null | undefined,
  options: NormalizeSafeRedirectPathOptions = {},
): string => {
  if (!input) {
    return '/';
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return '/';
  }

  const limitedInput = trimmed.slice(0, MAX_REDIRECT_INPUT_LENGTH);
  const sanitized = limitedInput.replace(CONTROL_CHARACTER_PATTERN, '');
  if (!sanitized) {
    return '/';
  }

  const decoded = decodeOnce(sanitized);
  if (hasUnsafeBackslashToken(sanitized) || hasUnsafeBackslashToken(decoded)) {
    return '/';
  }

  const absoluteUrlCandidate = getAbsoluteUrlCandidate(sanitized, decoded);
  if (absoluteUrlCandidate) {
    const allowedOrigins = resolveAllowedOrigins(options);
    if (allowedOrigins.size === 0) {
      return '/';
    }

    try {
      const target = new URL(absoluteUrlCandidate);
      if (!allowedOrigins.has(target.origin)) {
        return '/';
      }

      const relativeUrl = `${target.pathname}${target.search}${target.hash}`;
      if (relativeUrl.startsWith('//')) {
        return '/';
      }

      return relativeUrl || '/';
    } catch {
      return '/';
    }
  }

  if (
    sanitized.startsWith('//') ||
    decoded.startsWith('//')
  ) {
    return '/';
  }

  return sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
};
