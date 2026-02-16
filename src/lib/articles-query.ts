export type RawArticlesQuery = {
  page?: string | null;
  tag?: string | null;
  q?: string | null;
};

export type NormalizedArticlesQuery = {
  page: number;
  tag?: string;
  q?: string;
};

type NormalizeArticlesQueryOptions = {
  validTagIds?: ReadonlySet<string>;
};

const DEFAULT_PAGE = 1;
const MAX_PAGE = 100000;
const MAX_QUERY_LENGTH = 100;
const MAX_TAG_ID_LENGTH = 100;
const WHITESPACE_PATTERN = /\s+/g;

const normalizeWhitespace = (value: string) => value.replace(WHITESPACE_PATTERN, ' ').trim();

export const normalizePageParam = (rawPage: string | null | undefined): number => {
  if (!rawPage) {
    return DEFAULT_PAGE;
  }

  const parsed = Number.parseInt(rawPage, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_PAGE;
  }

  if (parsed > MAX_PAGE) {
    return MAX_PAGE;
  }

  return parsed;
};

export const normalizeQueryParam = (rawQuery: string | null | undefined): string | undefined => {
  if (!rawQuery) {
    return undefined;
  }

  const normalized = normalizeWhitespace(rawQuery);
  if (!normalized) {
    return undefined;
  }

  return normalized.slice(0, MAX_QUERY_LENGTH);
};

export const normalizeTagParam = (
  rawTag: string | null | undefined,
  options: NormalizeArticlesQueryOptions = {},
): string | undefined => {
  if (!rawTag) {
    return undefined;
  }

  const normalizedTag = normalizeWhitespace(rawTag);
  if (!normalizedTag || normalizedTag.length > MAX_TAG_ID_LENGTH) {
    return undefined;
  }

  if (options.validTagIds && !options.validTagIds.has(normalizedTag)) {
    return undefined;
  }

  return normalizedTag;
};

export const normalizeArticlesQuery = (
  raw: RawArticlesQuery,
  options: NormalizeArticlesQueryOptions = {},
): NormalizedArticlesQuery => {
  return {
    page: normalizePageParam(raw.page),
    tag: normalizeTagParam(raw.tag, options),
    q: normalizeQueryParam(raw.q),
  };
};
