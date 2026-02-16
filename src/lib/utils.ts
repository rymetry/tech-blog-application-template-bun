import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * フロント表示やメタデータ用の日付フォーマット。
 * 入力が不正な場合は空文字を返し、呼び出し側で非表示にできるようにする。
 */
export function formatDate(date: string | Date) {
  const parsed = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return format(parsed, 'yyyy-MM-dd');
}

export function truncateForSEO(text: string, maxLength = 160) {
  if (!text) {
    return '';
  }

  const normalized = text.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  if (maxLength <= 3) {
    return normalized.slice(0, maxLength);
  }

  const truncated = normalized.slice(0, maxLength - 3).trimEnd();
  return `${truncated}...`;
}

export function buildQueryString(params: Record<string, string | number | undefined | null>) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return query ? `?${query}` : '';
}

export function stripHtml(value: string | undefined | null) {
  if (!value) {
    return '';
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

type QueryValue = string | number | undefined | null;
type QueryParamsLike = URLSearchParams | { toString(): string };

/**
 * Builds an /articles path from current query params and updates.
 * When `resetPage` is true and `updates.page` is also provided,
 * page is deleted first and then re-added from updates (final value wins).
 */
export function buildArticlesPath(
  currentParams: QueryParamsLike,
  updates: Record<string, QueryValue>,
  options: { resetPage?: boolean } = {},
) {
  const nextParams = new URLSearchParams(currentParams.toString());

  if (options.resetPage) {
    nextParams.delete('page');
  }

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      nextParams.delete(key);
      return;
    }

    nextParams.set(key, String(value));
  });

  const query = nextParams.toString();
  return query ? `/articles?${query}` : '/articles';
}
