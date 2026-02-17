import { logWarnEvent } from '@/lib/log-warn';
import { NextResponse } from 'next/server';

const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_PRUNE_INTERVAL_MS = 10 * 1000;
const RATE_LIMIT_FORCE_PRUNE_THRESHOLD = 1024;
const DEDUPE_SEPARATOR = '\u001F';
const SUPPORTED_CONTENT_TYPES = ['application/csp-report', 'application/reports+json'] as const;

type RateLimitBucket = {
  count: number;
  windowStart: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();
let lastPruneAt = 0;

const createNoStoreResponse = () => {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
};

const getClientIp = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  return realIp || 'unknown';
};

const isRateLimited = (ip: string, now = Date.now()): boolean => {
  if (
    now - lastPruneAt >= RATE_LIMIT_PRUNE_INTERVAL_MS ||
    rateLimitBuckets.size >= RATE_LIMIT_FORCE_PRUNE_THRESHOLD
  ) {
    for (const [bucketIp, bucket] of rateLimitBuckets) {
      if (now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
        rateLimitBuckets.delete(bucketIp);
      }
    }
    lastPruneAt = now;
  }

  const current = rateLimitBuckets.get(ip);
  if (!current || now - current.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  return false;
};

const normalizeUriForLog = (value: unknown): string => {
  if (typeof value !== 'string') {
    return 'unknown';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 'unknown';
  }

  const normalized = trimmed.toLowerCase();
  if (
    normalized === 'inline' ||
    normalized === 'eval' ||
    normalized === 'self' ||
    normalized === 'none'
  ) {
    return normalized;
  }

  if (normalized.startsWith('data:')) {
    return 'data:';
  }

  if (normalized.startsWith('blob:')) {
    return 'blob:';
  }

  if (normalized.startsWith('about:')) {
    return 'about:';
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
    return parsed.protocol;
  } catch {
    return 'invalid-uri';
  }
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

const pickString = (record: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
};

const extractReportEntries = (raw: unknown): Record<string, unknown>[] => {
  const normalizeEntry = (entry: unknown): Record<string, unknown> => {
    const record = asRecord(entry);
    const reportingApiBody = asRecord(record.body);
    if (Object.keys(reportingApiBody).length > 0) {
      return reportingApiBody;
    }

    const cspReport = asRecord(record['csp-report']);
    if (Object.keys(cspReport).length > 0) {
      return cspReport;
    }

    return record;
  };

  if (Array.isArray(raw)) {
    return raw.map(normalizeEntry);
  }

  return [normalizeEntry(raw)];
};

const pickDirective = (entry: Record<string, unknown>): string => {
  return (
    pickString(entry, [
      'effective-directive',
      'effectiveDirective',
      'violated-directive',
      'violatedDirective',
    ]) || 'unknown'
  );
};

const createDedupeKey = (directive: string, blockedOrigin: string, documentOrigin: string): string =>
  `${directive}${DEDUPE_SEPARATOR}${blockedOrigin}${DEDUPE_SEPARATOR}${documentOrigin}`;

const isSupportedContentType = (contentType: string | null): boolean => {
  if (!contentType) {
    return false;
  }

  const normalized = contentType.toLowerCase();
  return SUPPORTED_CONTENT_TYPES.some((supportedType) => normalized.includes(supportedType));
};

const readRequestBodyWithLimit = async (
  request: Request,
): Promise<{ tooLarge: boolean; bodyText: string }> => {
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const parsedContentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(parsedContentLength) && parsedContentLength > MAX_BODY_BYTES) {
      return { tooLarge: true, bodyText: '' };
    }
  }

  if (!request.body) {
    return { tooLarge: false, bodyText: '' };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let totalBytes = 0;
  let bodyText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = value || new Uint8Array();
      totalBytes += chunk.byteLength;
      if (totalBytes > MAX_BODY_BYTES) {
        await reader.cancel();
        return { tooLarge: true, bodyText: '' };
      }

      bodyText += decoder.decode(chunk, { stream: true });
    }

    bodyText += decoder.decode();
    return { tooLarge: false, bodyText };
  } finally {
    reader.releaseLock();
  }
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return createNoStoreResponse();
    }

    if (!isSupportedContentType(request.headers.get('content-type'))) {
      return createNoStoreResponse();
    }

    const { tooLarge, bodyText } = await readRequestBodyWithLimit(request);
    if (tooLarge) {
      logWarnEvent({
        event: 'csp_report_payload_too_large',
        reason: 'body_size_limit_exceeded',
        context: { ip, maxBytes: MAX_BODY_BYTES },
      });
      return createNoStoreResponse();
    }

    let parsedBody: unknown = null;
    try {
      parsedBody = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      logWarnEvent({
        event: 'csp_report_payload_invalid_json',
        reason: 'json_parse_failed',
        context: { ip },
      });
      return createNoStoreResponse();
    }

    for (const entry of extractReportEntries(parsedBody)) {
      const directive = pickDirective(entry);
      const blockedOrigin = normalizeUriForLog(
        pickString(entry, ['blocked-uri', 'blockedURL', 'blockedUri']),
      );
      const documentOrigin = normalizeUriForLog(
        pickString(entry, ['document-uri', 'documentURL', 'documentUri']),
      );
      const sourceOrigin = normalizeUriForLog(
        pickString(entry, ['source-file', 'sourceFile']),
      );
      const statusCodeValue = entry['status-code'] ?? entry['statusCode'];
      const statusCode = typeof statusCodeValue === 'number' ? statusCodeValue : undefined;
      const effectiveDirective = pickString(entry, ['effective-directive', 'effectiveDirective']);
      const violatedDirective = pickString(entry, ['violated-directive', 'violatedDirective']);

      logWarnEvent({
        event: 'csp_violation_reported',
        reason: 'browser_violation_report',
        context: {
          dedupeKey: createDedupeKey(directive, blockedOrigin, documentOrigin),
          effectiveDirective,
          violatedDirective,
          blockedUri: blockedOrigin,
          documentUri: documentOrigin,
          sourceFile: sourceOrigin,
          statusCode,
          ip,
        },
      });
    }
  } catch {
    // 失敗してもレポート受付は常に成功扱いで返す。
  }

  return createNoStoreResponse();
}
