const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;
const ASCII_SAFE_PATTERN = /^[\x20-\x7E]+$/;

export const sanitizeMeasurementId = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!ASCII_SAFE_PATTERN.test(trimmed)) {
    console.warn('Invalid characters detected in GA measurement ID.');
    return null;
  }

  return GA4_MEASUREMENT_ID_PATTERN.test(trimmed.toUpperCase()) ? trimmed : null;
};

export const isAsciiSafe = (value: string) => ASCII_SAFE_PATTERN.test(value);

export const toUtf8Buffer = (value: string) => Buffer.from(value, 'utf8');

export const PAGINATION_LIMITS = {
  ARTICLES_LIST: 10,
  LATEST_POSTS: 3
} as const;