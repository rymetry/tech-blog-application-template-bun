import { logWarnEvent } from '@/lib/log-warn';

const GA4_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;
const ASCII_SAFE_PATTERN = /^[\x20-\x7E]+$/;

export const sanitizeMeasurementId = (value: string | undefined | null) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!ASCII_SAFE_PATTERN.test(trimmed)) {
    logWarnEvent({
      event: 'ga_measurement_id_invalid_characters',
      reason: 'non_ascii',
      context: { length: trimmed.length },
    });
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
